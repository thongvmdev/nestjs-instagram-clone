import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('oldest-users')
  getOldestUsers() {
    return this.analyticsService.getOldestUsers();
  }

  @Get('popular-signup-day')
  getPopularSignupDay() {
    return this.analyticsService.getPopularSignupDay();
  }

  @Get('inactive-users')
  getInactiveUsers() {
    return this.analyticsService.getInactiveUsers();
  }

  @Get('most-liked-photo')
  getMostLikedPhoto() {
    return this.analyticsService.getMostLikedPhoto();
  }

  @Get('avg-posts-per-user')
  getAvgPostsPerUser() {
    return this.analyticsService.getAvgPostsPerUser();
  }

  @Get('top-hashtags')
  getTopHashtags() {
    return this.analyticsService.getTopHashtags();
  }

  @Get('bot-accounts')
  getBotAccounts() {
    return this.analyticsService.getBotAccounts();
  }
}
