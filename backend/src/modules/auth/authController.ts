import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../database/prisma';
import { config } from '../../config';
import { AuthRequest } from '../../middleware/auth';

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
  name: z.string().optional(),
  primaryObjective: z.string().optional(),
  preferredProgressStyle: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);
    const resolvedName = validated.fullName || validated.name || 'Ascent User';
    
    const existing = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        fullName: resolvedName,
        profile: {
          create: {
            primaryObjective: validated.primaryObjective || 'Achieve balance and consistency',
            preferredProgressStyle: validated.preferredProgressStyle || 'BALANCED',
          },
        },
        notificationPreferences: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const msg = error.errors.map(e => e.message).join('. ');
      res.status(400).json({ error: msg });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: { profile: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        notificationPreferences: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profile: user.profile,
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
