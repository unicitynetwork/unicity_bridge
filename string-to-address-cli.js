#!/usr/bin/env node

/**
 * Bitcoin String Commitment CLI with Provably Unspendable Addresses
 * 
 * CLI tool for creating provably unspendable Bitcoin address commitments from input strings
 * and verifying Bitcoin addresses against input strings.
 */

const { generateBitcoinAddress, verifyBitcoinAddress, getUnspendabilityProof } = require('./alpha-address-commitment.js');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

// Display help information
function showHelp() {
  console.log(`
Bitcoin String Commitment Tool - Provably Unspendable Addresses

Usage:
  btc-commit generate <input-string>       Generate an unspendable Bitcoin address from a string
  btc-commit generate-file <file-path>     Generate an unspendable Bitcoin address from file contents
  btc-commit verify <address> <string>     Verify an address against a string
  btc-commit verify-file <address> <file>  Verify an address against file contents
  btc-commit proof <input-string>          Get technical proof of why an address is unspendable
  btc-commit help                          Show this help information

Examples:
  btc-commit generate "My secret information"
  btc-commit verify 3AbcDefGhijKlmnOpQrsTuv12345678 "My secret information"
  btc-commit proof "My secret information"
  `);
}

// Generate a Bitcoin address from an input string
function generateAddress(inputString) {
  try {
    const result = generateBitcoinAddress(inputString);
    
    console.log("\nProvably Unspendable Bitcoin Address Generated");
    console.log("===========================================");
    console.log(`Input string length: ${inputString.length} characters`);
    console.log(`Bitcoin Address: ${result.address}`);
    console.log(`Original Hash: ${result.originalHash}`);
    console.log(`\nUnspendable Script: ${result.scriptHex}`);
    console.log(`\nImport Command:\n${result.importCommand}`);
    console.log("\nThis address is PROVABLY UNSPENDABLE and can be safely published.");
    console.log("Run 'btc-commit proof \"your string\"' for technical proof of unspendability.");
    
    // Save to a file if the string is long
    if (inputString.length > 50) {
      const outputFile = `unspendable-${result.address.slice(0, 8)}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log(`\nDetails saved to: ${outputFile}`);
    }
    
    return result;
  } catch (error) {
    console.error("Error generating address:", error.message);
    process.exit(1);
  }
}

// Generate a Bitcoin address from a file's contents
function generateAddressFromFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found at ${fullPath}`);
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    console.log(`Reading file: ${fullPath}`);
    
    return generateAddress(fileContent);
  } catch (error) {
    console.error("Error reading file:", error.message);
    process.exit(1);
  }
}

// Verify a Bitcoin address against an input string
function verifyAddress(bitcoinAddress, inputString) {
  try {
    const isValid = verifyBitcoinAddress(bitcoinAddress, inputString);
    
    console.log("\nBitcoin Address Verification");
    console.log("===========================");
    console.log(`Bitcoin Address: ${bitcoinAddress}`);
    console.log(`Input string length: ${inputString.length} characters`);
    
    if (isValid) {
      const result = generateBitcoinAddress(inputString);
      console.log("\n✅ VERIFIED: The Bitcoin address matches the input string.");
      console.log(`This is a PROVABLY UNSPENDABLE address.`);
      console.log(`Script: ${result.scriptHex}`);
    } else {
      console.log("\n❌ NOT VERIFIED: The Bitcoin address does not match the input string.");
    }
    
    return isValid;
  } catch (error) {
    console.error("Error verifying address:", error.message);
    process.exit(1);
  }
}

// Verify a Bitcoin address against a file's contents
function verifyAddressWithFile(bitcoinAddress, filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found at ${fullPath}`);
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    console.log(`Reading file: ${fullPath}`);
    
    return verifyAddress(bitcoinAddress, fileContent);
  } catch (error) {
    console.error("Error reading file:", error.message);
    process.exit(1);
  }
}

// Get technical proof of unspendability
function showUnspendabilityProof(inputString) {
  try {
    const proof = getUnspendabilityProof(inputString);
    
    console.log("\nTechnical Proof of Unspendability");
    console.log("================================");
    console.log(`Bitcoin Address: ${proof.address}`);
    console.log(`\nVerification Method:\n${proof.verificationMethod}`);
    
    console.log("\nTechnical Reasons Why This Address Cannot Be Spent From:");
    proof.technicalProof.forEach((reason, index) => {
      console.log(`${index + 1}. ${reason}`);
    });
    
    console.log("\nScript Analysis:");
    console.log(`- Script Type: ${proof.scriptAnalysis.scriptType}`);
    console.log(`- Script Starts With: OP_RETURN (0x${proof.scriptAnalysis.scriptStart})`);
    console.log(`- Input String Hash Included: ${proof.scriptAnalysis.inputStringHashIncluded}`);
    console.log(`- Reference: ${proof.scriptAnalysis.bitcoinProtocolRules}`);
    
    // Save to a file
    const outputFile = `proof-${proof.address.slice(0, 8)}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(proof, null, 2));
    console.log(`\nDetailed proof saved to: ${outputFile}`);
    
    return proof;
  } catch (error) {
    console.error("Error generating proof:", error.message);
    process.exit(1);
  }
}

// Main program logic
function main() {
  // Handle different commands
  switch (command) {
    case 'generate':
      if (args.length < 2) {
        console.error("Error: Missing input string. Use 'btc-commit help' for usage information.");
        process.exit(1);
      }
      generateAddress(args[1]);
      break;
      
    case 'generate-file':
      if (args.length < 2) {
        console.error("Error: Missing file path. Use 'btc-commit help' for usage information.");
        process.exit(1);
      }
      generateAddressFromFile(args[1]);
      break;
      
    case 'verify':
      if (args.length < 3) {
        console.error("Error: Missing address or input string. Use 'btc-commit help' for usage information.");
        process.exit(1);
      }
      verifyAddress(args[1], args[2]);
      break;
      
    case 'verify-file':
      if (args.length < 3) {
        console.error("Error: Missing address or file path. Use 'btc-commit help' for usage information.");
        process.exit(1);
      }
      verifyAddressWithFile(args[1], args[2]);
      break;
      
    case 'proof':
      if (args.length < 2) {
        console.error("Error: Missing input string. Use 'btc-commit help' for usage information.");
        process.exit(1);
      }
      showUnspendabilityProof(args[1]);
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Run the program
main();