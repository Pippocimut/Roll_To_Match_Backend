"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const Campaign_1 = require("../database_models/Campaign");
const User_1 = require("../database_models/User");
const CreateReviewDTO_1 = require("../dto/CreateReviewDTO");
const UpdateReviewDTO_1 = require("../dto/UpdateReviewDTO");
class ReviewController {
    static createReview = createReview;
    static getReviews = getReviews;
    static getReview = getReview;
    static updateReview = updateReview;
    static deleteReview = deleteReview;
}
exports.ReviewController = ReviewController;
async function createReview(req, res) {
    const campaignId = req.params.campaignId;
    const userId = req.user;
    const createReviewDTO = CreateReviewDTO_1.CreateReviewZodSchema.parse(req.body);
    const { title, message, stars } = createReviewDTO;
    const campaign = await Campaign_1.CampaignModel.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    const user = await User_1.UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const review = {
        title: title,
        message: message,
        stars: stars,
        user: user._id,
        registeredAt: new Date()
    };
    campaign.reviews.push(review);
    await campaign.save();
    res.status(201).json(review);
}
async function getReviews(req, res) {
    const campaignId = req.params.campaignId;
    const campaign = await Campaign_1.CampaignModel.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    res.json(campaign.reviews);
}
async function getReview(req, res) {
    const reviewId = req.params.reviewId;
    const campaignId = req.params.campaignId;
    const campaign = await Campaign_1.CampaignModel.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    const review = campaign.reviews.id(reviewId);
    if (!review) {
        throw new Error('Review not found');
    }
    res.json(review);
}
async function updateReview(req, res) {
    const reviewId = req.params.reviewId;
    const campaignId = req.params.campaignId;
    const userId = req.user;
    const updateReviewDTO = UpdateReviewDTO_1.UpdateReviewZodSchema.parse(req.body);
    const { title, message, stars } = updateReviewDTO;
    const campaign = await Campaign_1.CampaignModel.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    const user = await User_1.UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (!campaign.reviews.id(reviewId)) {
        throw new Error('Review not found');
    }
    const review = campaign.reviews[reviewId];
    if (!review) {
        throw new Error('Review not found');
    }
    review.title = title || review.title;
    review.message = message || review.message;
    review.stars = stars || review.stars;
    review.registeredAt = new Date();
    await campaign.save();
    res.json(review);
}
async function deleteReview(req, res) {
    const reviewId = req.params.reviewId;
    const campaignId = req.params.campaignId;
    const userId = req.user;
    const campaign = await Campaign_1.CampaignModel.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    const user = await User_1.UserModel.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (!campaign.reviews.id(reviewId)) {
        throw new Error('Review not found');
    }
    const review = campaign.reviews[reviewId];
    if (!review) {
        throw new Error('Review not found');
    }
    campaign.reviews.pull(review);
    await campaign.save();
    res.json(review);
}
//# sourceMappingURL=ReviewController.js.map