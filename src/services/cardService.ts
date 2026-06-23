import { CreatorCard, ICreatorCard } from '../models/CreatorCard.js';
import { BusinessError } from '../middleware/errorHandler.js';
import { ulid } from 'ulid';

export class CardService {
  
  // Custom utility function matching strict requirements for unique auto generated slugs
  private static async generateUniqueSlug(title: string): Promise<string> {
    let base = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    const generateRandomSuffix = () => Math.random().toString(36).substring(2, 8);

    if (base.length < 5) {
      base = `${base}-${generateRandomSuffix()}`;
    }

    let existing = await CreatorCard.findOne({ slug: base });
    while (existing) {
      const suffix = generateRandomSuffix();
      base = `${base}-${suffix}`;
      existing = await CreatorCard.findOne({ slug: base });
    }

    return base;
  }

  public static async createCard(data: Partial<ICreatorCard>): Promise<ICreatorCard> {
    const timestamp = Date.now();
    let computedSlug = data.slug;

    // Trigger explicit unique check if a client-defined slug is provided
    if (computedSlug) {
      const slugPattern = /^[a-zA-Z0-9-_]{5,50}$/;
      if (!slugPattern.test(computedSlug)) {
        throw new BusinessError(400, 'SL01', 'Slug format is invalid.');
      }
      const existing = await CreatorCard.findOne({ slug: computedSlug });
      if (existing) {
        throw new BusinessError(400, 'SL02', 'Slug is already taken');
      }
    } else {
      computedSlug = await this.generateUniqueSlug(data.title!);
    }

    const accessType = data.access_type || 'public';
    const accessCode = data.access_code || null;

    // Enforce business rules logic conditional pins
    if (accessType === 'private' && (!accessCode || accessCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(accessCode))) {
      throw new BusinessError(400, 'AC01', 'access_code is required when access_type is private');
    }
    if (accessType === 'public' && accessCode !== null) {
      throw new BusinessError(400, 'AC05', 'access_code can only be set on private cards');
    }

    const newCard = new CreatorCard({
      _id: ulid(),
      title: data.title,
      description: data.description || '',
      slug: computedSlug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates,
      status: data.status,
      access_type: accessType,
      access_code: accessCode,
      created: timestamp,
      updated: timestamp,
      deleted: null
    });

    return await newCard.save();
  }

  public static async getCardBySlug(slug: string, accessCodeInput?: string): Promise<ICreatorCard> {
    const card = await CreatorCard.findOne({ slug });

    if (!card || card.deleted !== null) {
      throw new BusinessError(404, 'NF01', 'Creator card not found');
    }

    if (card.status === 'draft') {
      throw new BusinessError(404, 'NF02', 'Creator card not found');
    }

    if (card.access_type === 'private') {
      if (!accessCodeInput) {
        throw new BusinessError(403, 'AC03', 'This card is private. An access code is required');
      }
      if (card.access_code !== accessCodeInput) {
        throw new BusinessError(403, 'AC04', 'Invalid access code');
      }
    }

    return card;
  }

  public static async deleteCard(slug: string, creatorReference: string): Promise<ICreatorCard> {
    const card = await CreatorCard.findOne({ slug, deleted: null });

    if (!card) {
      throw new BusinessError(404, 'NF01', 'Creator card not found');
    }

    if (card.creator_reference !== creatorReference) {
      throw new BusinessError(400, 'AUTH_ERR', 'Creator reference mismatch.');
    }

    card.deleted = Date.now();
    card.updated = Date.now();
    return await card.save();
  }
}