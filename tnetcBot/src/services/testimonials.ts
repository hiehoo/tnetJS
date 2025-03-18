import { TestimonialInfo, ServiceType } from '../types';
import { TESTIMONIALS, TESTIMONIAL_CHANCE } from '../config';

class TestimonialService {
  private testimonials: TestimonialInfo[] = TESTIMONIALS;

  /**
   * Get testimonials for a specific service
   */
  getServiceTestimonials(service: ServiceType): TestimonialInfo[] {
    return this.testimonials.filter(t => t.serviceName === service);
  }

  /**
   * Get random testimonials that can be shown after welcome message
   * @returns 2-3 testimonials
   */
  getWelcomeTestimonials(): TestimonialInfo[] {
    // Determine if we should show testimonials based on probability
    if (Math.random() > TESTIMONIAL_CHANCE.AFTER_WELCOME) {
      return [];
    }

    // Get 2-3 random testimonials
    const count = Math.random() > 0.5 ? 2 : 3;
    return this.getRandomTestimonials(count);
  }

  /**
   * Get random testimonials for a specific service
   * @returns 1-2 testimonials or empty array
   */
  getInfoTestimonials(service: ServiceType): TestimonialInfo[] {
    // Determine if we should show testimonials based on probability
    if (Math.random() > TESTIMONIAL_CHANCE.AFTER_INFO) {
      return [];
    }

    // Get all testimonials for this service
    const serviceTestimonials = this.getServiceTestimonials(service);
    
    // If there are none, try to get general testimonials
    if (serviceTestimonials.length === 0) {
      return this.getRandomTestimonials(1);
    }

    // Get 1-2 random testimonials from the service
    const count = serviceTestimonials.length > 1 && Math.random() > 0.5 ? 2 : 1;
    return this.getRandomArrayElements(serviceTestimonials, count);
  }

  /**
   * Get testimonials for follow-up messages
   * @returns 1-2 testimonials that are most relevant for the service
   */
  getFollowUpTestimonials(service: ServiceType): TestimonialInfo[] {
    // Get all testimonials for this service
    const serviceTestimonials = this.getServiceTestimonials(service);
    
    // If there are none, try to get general testimonials
    if (serviceTestimonials.length === 0) {
      return this.getRandomTestimonials(1);
    }

    // Get 1-2 random testimonials from the service
    const count = serviceTestimonials.length > 1 ? 2 : 1;
    return this.getRandomArrayElements(serviceTestimonials, count);
  }

  /**
   * Get random testimonials from the entire collection
   */
  private getRandomTestimonials(count: number): TestimonialInfo[] {
    return this.getRandomArrayElements(this.testimonials, count);
  }

  /**
   * Get random elements from an array
   */
  private getRandomArrayElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

// Singleton instance
export const testimonialService = new TestimonialService(); 