// backend/utils/validators.js
const Joi = require("joi");

exports.validateCourseInput = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().min(0).required(),
  });
  return schema.validate(data);
};

exports.validateNewsInput = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    content: Joi.string().min(10).required(),
    summary: Joi.string().min(10).max(500).required(),
  });
  return schema.validate(data);
};