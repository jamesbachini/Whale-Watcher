const { ethers } = require('ethers');

const INFURA_API_KEY = '';
const TOKEN_ADDRESS = '';
const UNISWAP_POOL_ADDRESS = '';

const TRANSFER_EVENT_TOPIC = ethers.id('Transfer(address,address,uint256)');
const provider = new ethers.InfuraProvider('homestead', INFURA_API_KEY);
const ERC20_ABI = ['event Transfer(address indexed from, address indexed to, uint256 value)'];

async function getFirstBuyers(tokenAddress, exchangeAddress, startBlock, endBlock) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const filter = {
        address: tokenAddress,
        fromBlock: startBlock,
        toBlock: endBlock,
        topics: [
            TRANSFER_EVENT_TOPIC,
            ethers.zeroPadValue(exchangeAddress, 32),
        ],
    };
    const logs = await provider.getLogs(filter);
    const buyers = new Set();
    for (const log of logs) {
        const parsedLog = tokenContract.interface.parseLog(log);
        const toAddress = parsedLog.args.to;
        buyers.add(toAddress);
    }
    return Array.from(buyers);
}

(async () => {
    try {
        const startBlock = 18000000; // Aug 2023
        const endBlock = await provider.getBlockNumber();
        const firstBuyers = await getFirstBuyers(TOKEN_ADDRESS, UNISWAP_POOL_ADDRESS, startBlock, endBlock);
        console.log(firstBuyers);
    } catch (error) {
        console.error('Error:', error);
    }
})();
