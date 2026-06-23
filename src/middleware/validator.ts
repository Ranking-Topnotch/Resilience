import { Request, Response, NextFunction } from 'express';

export const validateCardCreation = (req: Request, res: Response, next: NextFunction) => {
  const { title, creator_reference, status, links, service_rates } = req.body;

  if (!title || typeof title !== 'string' || title.length < 3 || title.length > 100) {
    return res.status(400).json({ status: 'error', message: 'Title must be between 3 and 100 characters.' });
  }

  if (!creator_reference || typeof creator_reference !== 'string' || creator_reference.length !== 20) {
    return res.status(400).json({ status: 'error', message: 'creator_reference must be exactly 20 characters.' });
  }

  if (!status || !['draft', 'published'].includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Status must be either "draft" or "published".' });
  }

  if (links && Array.isArray(links)) {
    for (const link of links) {
      if (!link.title || link.title.length < 1 || link.title.length > 100) {
        return res.status(400).json({ status: 'error', message: 'Link title must be 1-100 characters.' });
      }
      if (!link.url || link.url.length > 200 || (!link.url.startsWith('http://') && !link.url.startsWith('https://'))) {
        return res.status(400).json({ status: 'error', message: 'Link URL must be valid and start with http:// or https://' });
      }
    }
  }

  if (service_rates) {
    const { currency, rates } = service_rates;
    if (!['NGN', 'USD', 'GBP', 'GHS'].includes(currency)) {
      return res.status(400).json({ status: 'error', message: 'Invalid currency specified.' });
    }
    if (!Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Rates must be a non-empty array when service_rates is present.' });
    }
    for (const rate of rates) {
      if (!rate.name || rate.name.length < 3 || rate.name.length > 100) {
        return res.status(400).json({ status: 'error', message: 'Rate name must be between 3 and 100 characters.' });
      }
      if (rate.description && rate.description.length > 250) {
        return res.status(400).json({ status: 'error', message: 'Rate description cannot exceed 250 characters.' });
      }
      if (!Number.isInteger(rate.amount) || rate.amount <= 0) {
        return res.status(400).json({ status: 'error', message: 'Rate amount must be a positive integer in minor units.' });
      }
    }
  }

  next();
};