import { Request, Response } from "express"
import { PersistedReview } from "../database_models/Review"
import { CampaignModel } from "../database_models/Campaign"
import { UserModel } from "../database_models/User"
import { CreateReviewDTO, CreateReviewZodSchema } from "../dto/CreateReviewDTO"
import { UpdateReviewDTO, UpdateReviewZodSchema } from "../dto/UpdateReviewDTO"

export class ReviewController {
    public static createReview = createReview
    public static getReviews = getReviews
    public static getReview = getReview
    public static updateReview = updateReview
    public static deleteReview = deleteReview
}

async function createReview(req: Request & { user: string }, res: Response): Promise<void> {
    const campaignId = req.params.campaignId
    const userId = req.user;
    const createReviewDTO: CreateReviewDTO = CreateReviewZodSchema.parse(req.body)
    const { title, message, stars } = createReviewDTO

    const campaign = await CampaignModel.findById(campaignId)
    if (!campaign) {
        throw new Error('Campaign not found')
    }

    const user = await UserModel.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }

    const review: PersistedReview = {
        title: title,
        message: message,
        stars: stars,
        user: user._id,
        registeredAt: new Date()
    }

    campaign.reviews.push(review)
    await campaign.save()
    res.status(201).json(review)
}
async function getReviews(req: Request & { user: string }, res: Response): Promise<void> {
    const campaignId = req.params.campaignId
    const campaign = await CampaignModel.findById(campaignId)
    if (!campaign) {
        throw new Error('Campaign not found')
    }

    res.json(campaign.reviews)
}
async function getReview(req: Request & { user: string }, res: Response): Promise<void> {
    const reviewId = req.params.reviewId
    const campaignId = req.params.campaignId
    const campaign = await CampaignModel.findById(campaignId)
    if (!campaign) {
        throw new Error('Campaign not found')
    }
    const review = campaign.reviews.id(reviewId)
    if (!review) {
        throw new Error('Review not found')
    }
    res.json(review)
}
async function updateReview(req: Request & { user: string }, res: Response): Promise<void> {
    const reviewId = req.params.reviewId
    const campaignId = req.params.campaignId
    const userId = req.user
    const updateReviewDTO: UpdateReviewDTO = UpdateReviewZodSchema.parse(req.body)
    const { title, message, stars } = updateReviewDTO

    const campaign = await CampaignModel.findById(campaignId)
    if (!campaign) {
        throw new Error('Campaign not found')
    }

    const user = await UserModel.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }
    if (!campaign.reviews.id(reviewId)) {
        throw new Error('Review not found')
    }

    const review: PersistedReview | null = campaign.reviews[reviewId]
    if (!review) {
        throw new Error('Review not found')
    }

    review.title = title || review.title
    review.message = message || review.message
    review.stars = stars || review.stars
    review.registeredAt = new Date()

    await campaign.save()
    res.json(review)

}
async function deleteReview(req: Request & { user: string }, res: Response): Promise<void> {
    const reviewId = req.params.reviewId
    const campaignId = req.params.campaignId
    const userId = req.user

    const campaign = await CampaignModel.findById(campaignId)
    if (!campaign) {
        throw new Error('Campaign not found')
    }

    const user = await UserModel.findById(userId)
    if (!user) {
        throw new Error('User not found')
    }
    if (!campaign.reviews.id(reviewId)) {
        throw new Error('Review not found')
    }

    const review: PersistedReview | null = campaign.reviews[reviewId]
    if (!review) {
        throw new Error('Review not found')
    }

    campaign.reviews.pull(review)
    await campaign.save()
    res.json(review)
}