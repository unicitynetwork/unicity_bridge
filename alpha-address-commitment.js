/**
 * Bitcoin String Commitment Library
 * 
 * This library provides functionality to create non-spendable Bitcoin addresses
 * from input strings and verify that a given Bitcoin address was derived
 * from a specific input string.
 */

const crypto = require('crypto');
const bs58 = require('bs58');

/**
 * Creates a non-spendable Bitcoin address derived from an input string.
 * 
 * @param {string} inputString - The secret string to commit to
 * @returns {object} Object containing the Bitcoin address and intermediate hash
 */
function generateBitcoinAddress(inputString) {
  // Create a SHA-256 hash of the input string
  const stringHash = crypto.createHash('sha256')
    .update(inputString)
    .digest();
  
  // Use the first 20 bytes of the hash as a RIPEMD-160 equivalent
  // This creates a public key hash format compatible with Bitcoin addresses
  const publicKeyHash = stringHash.slice(0, 20);
  
  // Add version byte (0x00 for mainnet Bitcoin addresses)
  const versionedPayload = Buffer.concat([
    Buffer.from([0x00]), 
    publicKeyHash
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
    hash: stringHash.toString('hex')
  };
}

/**
 * Verifies that a Bitcoin address was derived from a specific input string.
 * 
 * @param {string} bitcoinAddress - The Bitcoin address to verify
 * @param {string} claimedString - The input string that supposedly generated the address
 * @returns {boolean} True if the address was derived from the input string, false otherwise
 */
function verifyBitcoinAddress(bitcoinAddress, claimedString) {
  try {
    // Hash the claimed string
    const claimedHash = crypto.createHash('sha256')
      .update(claimedString)
      .digest();
    
    // Decode the Bitcoin address
    const addressBytes = bs58.decode(bitcoinAddress);
    
    // Extract the public key hash portion (bytes 1-21)
    const extractedHash = addressBytes.slice(1, 21);
    
    // Verify that the first 20 bytes of the claimed hash match
    return Buffer.compare(claimedHash.slice(0, 20), extractedHash) === 0;
  } catch (error) {
    // Handle invalid Bitcoin address format
    console.error("Verification error:", error.message);
    return false;
  }
}

module.exports = {
  generateBitcoinAddress,
  verifyBitcoinAddress
};
