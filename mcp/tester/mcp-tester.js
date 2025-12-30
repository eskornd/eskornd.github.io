// mcp-tester.js - MCP Server Testing Tool

/**
 * MCP Client Class
 * Handles communication with MCP Server via streamable HTTP protocol
 */
class MCPClient {
    /**
     * Initialize MCP client
     * @param {string} baseUrl - Server URL
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.sessionId = null;
        this.requestId = 1;
        this.outputElement = document.getElementById('output');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
    }

    /**
     * Update connection status indicator
     * @param {boolean} isConnected - Connection status
     */
    updateStatus(isConnected) {
        if (isConnected) {
            this.statusIndicator.className = 'status-indicator status-connected';
            this.statusText.textContent = 'Connected';
        } else {
            this.statusIndicator.className = 'status-indicator status-disconnected';
            this.statusText.textContent = 'Disconnected';
        }
    }

    /**
     * Clear output area
     */
    clearOutput() {
        this.outputElement.innerHTML = '';
    }

    /**
     * Add log message to output area
     * @param {string} message - Log message
     * @param {string} type - Message type: 'info', 'success', or 'error'
     */
    log(message, type = 'info') {
        const logElement = document.createElement('div');
        logElement.className = `log ${type}`;
        logElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.outputElement.appendChild(logElement);
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    /**
     * Send JSON-RPC request to MCP Server
     * @param {string} method - JSON-RPC method name
     * @param {Object} params - Method parameters
     * @returns {Promise<Object>} Response data
     */
    async sendRequest(method, params = {}) {
        const requestId = this.requestId++;
        const requestBody = {
            jsonrpc: '2.0',
            id: requestId,
            method: method,
            params: params
        };

        this.log(`Sending request: ${method}`, 'info');

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            
            if (responseData.error) {
                this.log(`Error response: ${JSON.stringify(responseData.error)}`, 'error');
                throw new Error(`JSON-RPC Error: ${JSON.stringify(responseData.error)}`);
            }

            this.log(`Request successful: ${method}`, 'success');
            this.updateStatus(true);
            return responseData.result || responseData;

        } catch (error) {
            this.log(`Request failed: ${error.message}`, 'error');
            this.updateStatus(false);
            throw error;
        }
    }

    /**
     * Initialize MCP session
     * @returns {Promise<Object>} Initialization result
     */
    async initialize() {
        this.log('=== Starting initialization ===', 'info');
        
        try {
            const initParams = {
                protocolVersion: '2024-11-05',
                capabilities: {
                    roots: { listChanged: true },
                    sampling: { supportsStreaming: true }
                },
                clientInfo: {
                    name: 'MCP-HTML-Client',
                    version: '1.0.0'
                }
            };

            const result = await this.sendRequest('initialize', initParams);
            
            if (result.sessionId) {
                this.sessionId = result.sessionId;
                this.log(`Session established, Session ID: ${this.sessionId}`, 'success');
            }
            
            return result;
        } catch (error) {
            this.log(`Initialization failed: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * List available tools from MCP Server
     * @returns {Promise<Object>} Tools list result
     */
    async listTools() {
        this.log('=== Listing tools ===', 'info');
        
        try {
            const params = {};
            if (this.sessionId) {
                params.sessionId = this.sessionId;
            }
            
            const result = await this.sendRequest('tools/list', params);
            
            if (result && result.tools && Array.isArray(result.tools)) {
                this.log(`Found ${result.tools.length} tools:`, 'success');
                
                result.tools.forEach((tool, index) => {
                    this.log(`${index + 1}. ${tool.name}`, 'info');
                    if (tool.description) {
                        this.log(`   Description: ${tool.description}`, 'info');
                    }
                    if (tool.inputSchema) {
                        this.log(`   Input schema: ${JSON.stringify(tool.inputSchema, null, 2)}`, 'info');
                    }
                });
            } else {
                this.log('No tools found or incorrect format', 'error');
                if (result) {
                    this.log(`Response: ${JSON.stringify(result, null, 2)}`, 'info');
                }
            }
            
            return result;
        } catch (error) {
            this.log(`Failed to list tools: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Perform health check on MCP Server
     */
    async healthCheck() {
        this.log('=== Health check ===', 'info');
        
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: this.requestId++,
                    method: 'health',
                    params: {}
                })
            });
            
            if (response.ok) {
                const text = await response.text();
                this.log(`Health check successful: ${text}`, 'success');
                this.updateStatus(true);
            } else {
                this.log(`Health check failed: ${response.status}`, 'error');
                this.updateStatus(false);
            }
        } catch (error) {
            this.log(`Health check error: ${error.message}`, 'error');
            this.updateStatus(false);
        }
    }

    /**
     * Run complete MCP Server test
     */
    async runFullTest() {
        this.clearOutput();
        this.log('Starting MCP Server test...', 'info');
        this.log(`Server URL: ${this.baseUrl}`, 'info');
        
        try {
            // 1. Health check
            await this.healthCheck();
            
            // 2. Initialize
            const initResult = await this.initialize();
            this.log(`Initialization result: ${JSON.stringify(initResult, null, 2)}`, 'info');
            
            // 3. List tools
            await this.listTools();
            
            this.log('=== Test completed successfully ===', 'success');
            
        } catch (error) {
            this.log(`Test failed: ${error.message}`, 'error');
            
            // Try alternative endpoints
            this.log('Trying alternative endpoints...', 'info');
            await this.testAlternativeEndpoints();
        }
    }

    /**
     * Test alternative endpoints for compatibility
     */
    async testAlternativeEndpoints() {
        const endpoints = [
            { method: 'initialize', params: { protocolVersion: '2024-11-05' } },
            { method: 'tools/list', params: {} },
            { method: 'ping', params: {} }
        ];
        
        for (const endpoint of endpoints) {
            try {
                this.log(`Trying endpoint: ${endpoint.method}`, 'info');
                const response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: this.requestId++,
                        method: endpoint.method,
                        params: endpoint.params
                    })
                });
                
                if (response.ok) {
                    const text = await response.text();
                    this.log(`${endpoint.method}: Success - ${text.substring(0, 100)}...`, 'success');
                } else {
                    this.log(`${endpoint.method}: Failed - ${response.status}`, 'error');
                }
            } catch (error) {
                this.log(`${endpoint.method}: Error - ${error.message}`, 'error');
            }
        }
    }
}

/**
 * Initialize the MCP Testing Tool
 * Sets up event listeners and global functions
 */
function initializeMCPTester() {
    const serverUrlInput = document.getElementById('serverUrl');
    const runTestBtn = document.getElementById('runTestBtn');
    const initBtn = document.getElementById('initBtn');
    const toolsBtn = document.getElementById('toolsBtn');

    // Create initial client instance
    let mcpClient = new MCPClient(serverUrlInput.value);

    /**
     * Update client instance when server URL changes
     */
    serverUrlInput.addEventListener('change', function() {
        mcpClient = new MCPClient(this.value);
    });

    /**
     * Run full test button handler
     */
    runTestBtn.addEventListener('click', async function() {
        runTestBtn.disabled = true;
        runTestBtn.textContent = 'Testing...';
        
        try {
            await mcpClient.runFullTest();
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            runTestBtn.disabled = false;
            runTestBtn.textContent = 'Run Full Test';
        }
    });

    /**
     * Initialize only button handler
     */
    initBtn.addEventListener('click', async function() {
        initBtn.disabled = true;
        initBtn.textContent = 'Initializing...';
        
        try {
            mcpClient.clearOutput();
            await mcpClient.initialize();
        } catch (error) {
            console.error('Initialization error:', error);
        } finally {
            initBtn.disabled = false;
            initBtn.textContent = 'Initialize Only';
        }
    });

    /**
     * List tools button handler
     */
    toolsBtn.addEventListener('click', async function() {
        toolsBtn.disabled = true;
        toolsBtn.textContent = 'Fetching Tools...';
        
        try {
            mcpClient.clearOutput();
            await mcpClient.listTools();
        } catch (error) {
            console.error('Tools listing error:', error);
        } finally {
            toolsBtn.disabled = false;
            toolsBtn.textContent = 'List Tools';
        }
    });

    /**
     * Make client instance available globally
     */
    window.mcpClient = mcpClient;
    
    console.log('MCP Testing Tool initialized. Use window.mcpClient to access the client in console.');
}

/**
 * Run MCP test from console
 * @param {string} customUrl - Optional custom server URL
 * @returns {Promise<Object>} Test results
 */
window.runMCPTest = async function(customUrl = null) {
    console.log('Starting MCP test...');
    
    const url = customUrl || document.getElementById('serverUrl').value;
    const client = new MCPClient(url);
    
    try {
        // 1. Initialize
        console.log('1. Initializing...');
        const initResult = await client.initialize();
        console.log('Initialization successful:', initResult);
        
        // 2. List tools
        console.log('\n2. Listing tools...');
        const toolsResult = await client.listTools();
        console.log('Tools list:', toolsResult);
        
        console.log('\nTest completed successfully!');
        return { success: true, initResult, toolsResult };
    } catch (error) {
        console.error('Test failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Quick test function for console
 * @returns {Promise<Object|null>} Server response
 */
window.quickTest = async function() {
    console.log('Running quick MCP test...');
    const url = document.getElementById('serverUrl').value;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/list',
                params: {}
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Server response:', data);
            
            if (data.result && data.result.tools) {
                console.log(`Found ${data.result.tools.length} tools`);
                data.result.tools.forEach(tool => {
                    console.log(`- ${tool.name}: ${tool.description || 'No description'}`);
                });
            }
            
            return data;
        } else {
            console.error(`Server error: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('Connection error:', error);
        return null;
    }
};

function getMcpParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const mcpParam = urlParams.get('mcp');

    if (mcpParam) {
        return decodeURIComponent(mcpParam);
    }
    return null;
}

function initMCPURL()
{
	let mcpUrl = getMcpParam();
	mcpUrl = decodeURIComponent(mcpUrl);
	if (mcpUrl) {
		console.log('MCP URL:', mcpUrl);
	} else {
		mcpUrl = 'https://127.0.0.1:14330/mcp';
		console.log('NO MCP URL, using default: ', mcpUrl);
	}

	let elem = document.getElementById('serverUrl')
	console.log( 'elem serverUrl' + elem);
	elem.value = mcpUrl;
}

/**
 * Test with custom server URL
 * @param {string} url - Server URL to test
 * @returns {Promise<Object>} Test results
 */
window.testServer = async function(url) {
    console.log(`Testing server at: ${url}`);
    return await window.runMCPTest(url);
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
	initMCPURL();
    document.addEventListener('DOMContentLoaded', initializeMCPTester);
} else {
	initMCPURL();
    initializeMCPTester();
}
