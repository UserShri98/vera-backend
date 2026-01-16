// Import the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.VERA_PINECONE_API_KEY });

// Access the specific index using the name from environment variables
const veraIndex = pc.Index(process.env.VECTOR_INDEX_NAME);
