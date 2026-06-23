import { Request, Response, NextFunction } from 'express';
import { CardService } from '../services/cardService.js';



export class CardController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createdRecord = await CardService.createCard(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Creator Card Created Successfully.',
        data: createdRecord.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const accessCode = typeof req.query.access_code === 'string'
        ? req.query.access_code
        : undefined;

      const card = await CardService.getCardBySlug(slug, accessCode);
      const responseData = card.toJSON();
      
      // Clean up protection layer: Remove fields never meant for public consumption
      delete responseData.access_code;

      res.status(200).json({
        status: 'success',
        message: 'Creator Card Retrieved Successfully.',
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  }

  public static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const { creator_reference } = req.body;

      if (!creator_reference || typeof creator_reference !== 'string' || creator_reference.length !== 20) {
         res.status(400).json({ status: 'error', message: 'A valid 20-character creator_reference body is required.' });
         return;
      }

      const deletedRecord = await CardService.deleteCard(slug, creator_reference);
      res.status(200).json({
        status: 'success',
        message: 'Creator Card Deleted Successfully.',
        data: deletedRecord.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
}