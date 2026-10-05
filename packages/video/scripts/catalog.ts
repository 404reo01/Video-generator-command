/**
 * Regenerates .claude/skills/mappa/catalog.md (sets, characters, illustrations, icons, music).
 *
 * Usage: npm run catalog -w @mappa/video
 */
import { writeCatalog } from './build-catalog';

console.log(`catalog -> ${writeCatalog()}`);
