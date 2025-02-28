#!/usr/bin/env node

/**
 * Bitcoin String Commitment CLI
 * 
 * CLI tool for creating Bitcoin address commitments from input strings
 * and verifying Bitcoin addresses against input strings.
 */

const { generateBitcoinAddress, verifyBitcoinAddress } = require('./alpha-address-commitment.js');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

// Display help information
function showHelp() {
  console.log(`
Bitcoin String Commitment Tool

Usage:
  btc-commit generate <input-string>       Generate a Bitcoin address from a string
  btc-commit generate-file <file-path>     Generate a Bitcoin address from file contents
  btc-commit verify <address> <string>     Verify an address against a string
  btc-commit verify-file <address> <file>  Verify an address against file contents
  btc-commit help                          Show this help information

Examples:
  btc-commit generate "My secret information"
  btc-commit verify 1D8xJnjxNhNiSymuhmHLmQNAnvPJsZ1kY5 "My secret information"
  `);
}

// Generate a Bitcoin address from an input string
function generateAddress(inputString) {
  try {
    const result = generateBitcoinAddress(inputString);
    
    console.log("\nBitcoin Address Commitment Generated");
    console.log("=====================================");
    console.log(`Input string length: ${inputString.length} characters`);
    console.log(`Bitcoin Address: ${result.address}`);
    console.log(`SHA-256 Hash: ${result.hash}`);
    console.log("\nThis address is non-spendable and can be safely published.");
    
    return result.address;
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
      console.log("\n✅ VERIFIED: The Bitcoin address matches the input string.");
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
