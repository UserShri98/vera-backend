// Import the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.VERA_PINECONE_API_KEY });

// Access the specific index using the name from environment variables
const veraIndex = pc.Index(process.env.VECTOR_INDEX_NAME);

const createMemory = async ({ vector, messageId, metadata }) => {
  await veraIndex.upsert([
    {
      id: messageId,
      values: vector,
      metadata: metadata,
    },
  ]);
};

const queryMemory = async ({ quaryVector, limit = 5, metadata }) => {
  const data = await veraIndex.query({
    vector: quaryVector,
    topK: limit,
    filter: metadata ? metadata : undefined,
    includeMetadata: true,
  });
  return data.matches;
};

module.exports = { createMemory, queryMemory };