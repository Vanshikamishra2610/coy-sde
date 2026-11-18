import { NextResponse } from 'next/server';
import { DiscoverError } from './discover.js';

export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function handleError(err) {
  if (err instanceof DiscoverError) {
    return json({ error: { code: err.code, message: err.message } }, err.status);
  }
  console.error(err);
  return json({ error: { code: 'internal', message: 'Something went wrong.' } }, 500);
}
