/**
 * Bitcoin String Commitment Library with Provably Unspendable Addresses
 * 
 * This library provides functionality to create provably unspendable Bitcoin addresses
 * from input strings and verify that a given address was derived
 * from a specific input string.
 */

const crypto = require('crypto');
const bs58 = require('bs58');

/**
 * Creates a provably unspendable Bitcoin address derived from an input string.
 * 
 * @param {string} inputString - The string to commit to
 * @returns {object} Object containing the unspendable address and verification data
 */
function generateBitcoinAddress(inputString) {
  // Create a SHA-256 hash of the input string
  const stringHash = crypto.createHash('sha256')
    .update(inputString)
    .digest();
  
  // Create a provably unspendable OP_RETURN script with the hash
  // Format: OP_RETURN <data>
  const dataToStore = Buffer.concat([
    Buffer.from('UNSPENDABLE:'),
    stringHash
  ]);
  
  const opReturnScript = Buffer.concat([
    Buffer.from('6a', 'hex'),     // OP_RETURN
    Buffer.from([dataToStore.length]), // Length of data
    dataToStore
  ]);
  
  // Create P2SH address from the OP_RETURN script
  // This creates a provably unspendable address since it's invalid to spend from OP_RETURN
  const scriptHash = crypto.createHash('sha256')
    .update(opReturnScript)
    .digest();
  
  const ripemd160Hash = crypto.createHash('ripemd160')
    .update(scriptHash)
    .digest();
  
  // Create P2SH address (Pay to Script Hash)
  // Add version byte (0x05 for P2SH addresses)
  const versionedPayload = Buffer.concat([
    Buffer.from([0x05]),  // Version byte for P2SH
    ripemd160Hash
  ]);
  
  // Create checksum (double SHA-256, first 4 bytes)
  const firstSHA = crypto.createHash('sha256').update(versionedPayload).digest();
  const secondSHA = crypto.createHash('sha256').update(firstSHA).digest();
  const checksum = secondSHA.slice(0, 4);
  
  // Combine versioned payload and checksum
  const addressBytes = Buffer.concat([versionedPayload, checksum]);
  
  // Encode with Base58
  const bitcoinAddress = bs58.encode(addressBytes);
  
  return {
    address: bitcoinAddress,
    originalHash: stringHash.toString('hex'),
    scriptHex: opReturnScript.toString('hex'),
    isUnspendable: true,
    verificationMethod: "SHA-256 hash of input string embedded in OP_RETURN script, then wrapped in P2SH",
    inputLength: inputString.length,
    importCommand: `bitcoin-cli importaddress ${opReturnScript.toString('hex')} "Unspendable commitment: ${inputString.substring(0, 20)}..." false`
  };
}

/**
 * Verifies that an unspendable Bitcoin address was derived from a specific input string.
 * 
 * @param {string} bitcoinAddress - The Bitcoin address to verify
 * @param {string} claimedString - The input string that supposedly generated the address
 * @returns {boolean} True if the address was derived from the input string, false otherwise
 */
function verifyBitcoinAddress(bitcoinAddress, claimedString) {
  try {
    // Generate the expected address from the claimed string
    const generated = generateBitcoinAddress(claimedString);
    
    // Compare the addresses
    return generated.address === bitcoinAddress;
  } catch (error) {
    // Handle invalid Bitcoin address format
    console.error("Verification error:", error.message);
    return false;
  }
}

/**
 * Returns technical proof of why an address is unspendable
 * 
 * @param {string} inputString - The original input string
 * @returns {object} Technical proof details
 */
function getUnspendabilityProof(inputString) {
  const result = generateBitcoinAddress(inputString);
  
  return {
    ...result,
    technicalProof: [
      "Address is a Pay-to-Script-Hash (P2SH) address that resolves to an OP_RETURN script.",
      "OP_RETURN scripts are provably unspendable in Bitcoin as they explicitly mark outputs as invalid for spending.",
      "The unspendable script contains a hash of the original input string, allowing verification.",
      "When attempting to spend from this address, the transaction would be rejected by Bitcoin nodes."
    ],
    scriptAnalysis: {
      scriptType: "P2SH wrapping OP_RETURN",
      scriptStart: "6a", // OP_RETURN opcode
      inputStringHashIncluded: true,
      bitcoinProtocolRules: "https://github.com/bitcoin/bitcoin/blob/master/src/script/interpreter.cpp#L467"
    }
  };
}

module.exports = {
  generateBitcoinAddress,
  verifyBitcoinAddress,
  getUnspendabilityProof
};