import { NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/db';
import { CATEGORY_CONFIG } from '@/app/constants';
import { getLocalDateString } from '@/lib/simple';

