const axios = require('axios');
const answerModel = require('../models/answer.model');

const sendAnswersToCohere = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    if (!questionId) {
      return res.status(400).json({ error: "Question ID is required" });
    }
    
    const answers = await answerModel.find({ questionId });
    
    if (!answers || answers.length === 0) {
      return res.status(404).json({ error: "No answers found for this question." });
    }
    
    const answerTexts = answers.map(a => a.answerText).join('\n');
    
    const cohereResponse = await axios.post(
      'https://api.cohere.ai/v1/summarize',
      {
        text: `Here are the responses from multiple people to a decision:\n${answerTexts}\n\nSummarize the overall sentiment, and highlight unique pros and cons.`,
        length: 'auto',           
        format: 'bullets',          
        model: 'command-r-08-2024',  // Updated to current supported model
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({ summary: cohereResponse.data.summary });
    
  } catch (err) {
    console.error("Cohere summarization error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to summarize with Cohere" });
  }
};

module.exports = {
  sendAnswersToCohere,
};
