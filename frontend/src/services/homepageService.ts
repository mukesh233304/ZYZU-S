/**
 * FOCUSPOINT — Homepage Service
 * 
 * Manages homepage configuration, hero carousel slides,
 * and section visibility controls in a CMS-ready frontend-first abstraction.
 */

import { HeroSlide, HomepageConfig } from '../types/homepage';
import { DEFAULT_HERO_SLIDES, DEFAULT_HOMEPAGE_CONFIG } from '../mock/data/homepageData';

class HomepageService {
  /**
   * Returns curated hero slides for the full-width carousel.
   * Can later be replaced by InsForge CMS/backend endpoint.
   */
  public async getHeroSlides(): Promise<HeroSlide[]> {
    await new Promise(resolve => setTimeout(resolve, 40));
    return [...DEFAULT_HERO_SLIDES];
  }

  /**
   * Returns active homepage section toggles and rotation timings.
   */
  public async getHomepageConfig(): Promise<HomepageConfig> {
    await new Promise(resolve => setTimeout(resolve, 30));
    return { ...DEFAULT_HOMEPAGE_CONFIG };
  }
}

export const homepageService = new HomepageService();
