const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } = require('firebase/firestore');

// Firebase configuration - you'll need to set these environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirebaseMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'firebase-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupTools();
    }

    setupTools() {
        // Tool to get all documents from a collection
        this.server.setRequestHandler('tools/call', async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'get_collection':
                    return await this.getCollection(args.collection);
                
                case 'add_document':
                    return await this.addDocument(args.collection, args.data);
                
                case 'update_document':
                    return await this.updateDocument(args.collection, args.documentId, args.data);
                
                case 'delete_document':
                    return await this.deleteDocument(args.collection, args.documentId);
                
                case 'query_documents':
                    return await this.queryDocuments(args.collection, args.filters, args.orderBy, args.limit);
                
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }

    async getCollection(collectionName) {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(documents, null, 2)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error getting collection ${collectionName}: ${error.message}`
                    }
                ]
            };
        }
    }

    async addDocument(collectionName, data) {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Document added successfully with ID: ${docRef.id}`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error adding document: ${error.message}`
                    }
                ]
            };
        }
    }

    async updateDocument(collectionName, documentId, data) {
        try {
            const docRef = doc(db, collectionName, documentId);
            await updateDoc(docRef, data);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Document ${documentId} updated successfully`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error updating document: ${error.message}`
                    }
                ]
            };
        }
    }

    async deleteDocument(collectionName, documentId) {
        try {
            const docRef = doc(db, collectionName, documentId);
            await deleteDoc(docRef);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Document ${documentId} deleted successfully`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error deleting document: ${error.message}`
                    }
                ]
            };
        }
    }

    async queryDocuments(collectionName, filters = [], orderByField = null, limitCount = null) {
        try {
            let q = collection(db, collectionName);
            
            // Apply filters
            filters.forEach(filter => {
                q = query(q, where(filter.field, filter.operator, filter.value));
            });
            
            // Apply ordering
            if (orderByField) {
                q = query(q, orderBy(orderByField));
            }
            
            // Apply limit
            if (limitCount) {
                q = query(q, limit(limitCount));
            }
            
            const querySnapshot = await getDocs(q);
            const documents = [];
            querySnapshot.forEach((doc) => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(documents, null, 2)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error querying documents: ${error.message}`
                    }
                ]
            };
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Firebase MCP Server running...');
    }
}

// Tool definitions for the MCP
const tools = [
    {
        name: 'get_collection',
        description: 'Get all documents from a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'Name of the collection to retrieve'
                }
            },
            required: ['collection']
        }
    },
    {
        name: 'add_document',
        description: 'Add a new document to a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'Name of the collection to add the document to'
                },
                data: {
                    type: 'object',
                    description: 'Document data to add'
                }
            },
            required: ['collection', 'data']
        }
    },
    {
        name: 'update_document',
        description: 'Update an existing document in a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'Name of the collection containing the document'
                },
                documentId: {
                    type: 'string',
                    description: 'ID of the document to update'
                },
                data: {
                    type: 'object',
                    description: 'Updated document data'
                }
            },
            required: ['collection', 'documentId', 'data']
        }
    },
    {
        name: 'delete_document',
        description: 'Delete a document from a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'Name of the collection containing the document'
                },
                documentId: {
                    type: 'string',
                    description: 'ID of the document to delete'
                }
            },
            required: ['collection', 'documentId']
        }
    },
    {
        name: 'query_documents',
        description: 'Query documents from a Firestore collection with filters, ordering, and limits',
        inputSchema: {
            type: 'object',
            properties: {
                collection: {
                    type: 'string',
                    description: 'Name of the collection to query'
                },
                filters: {
                    type: 'array',
                    description: 'Array of filter objects with field, operator, and value',
                    items: {
                        type: 'object',
                        properties: {
                            field: { type: 'string' },
                            operator: { type: 'string' },
                            value: {}
                        }
                    }
                },
                orderBy: {
                    type: 'string',
                    description: 'Field name to order results by'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of documents to return'
                }
            },
            required: ['collection']
        }
    }
];

// Export tools for MCP configuration
module.exports = { FirebaseMCPServer, tools };

// Run the server if this file is executed directly
if (require.main === module) {
    const server = new FirebaseMCPServer();
    server.run().catch(console.error);
} 