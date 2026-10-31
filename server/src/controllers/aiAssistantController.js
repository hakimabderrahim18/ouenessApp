const { queryAiAssistant } = require('../services/aiAssistantService');
const { logAudit } = require('../services/auditService');

const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, language } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message query',
      });
    }

    const response = await queryAiAssistant({
      message,
      userLanguage: language || req.user.preferredLanguage || 'ar',
      user: req.user,
    });

    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'AI_ASSISTANT',
      targetId: '',
      targetModel: 'AiChat',
      description: {
        ar: `استفسار المساعد الذكي: "${message.slice(0, 40)}..."`,
        fr: `Requête Assistant IA: "${message.slice(0, 40)}..."`,
        en: `AI Assistant query: "${message.slice(0, 40)}..."`,
      },
    });

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant,
};
