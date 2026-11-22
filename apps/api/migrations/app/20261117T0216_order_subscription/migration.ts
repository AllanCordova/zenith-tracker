#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1805657ed4679e2ff58077456dd2a5d47d5aa97edaaa26f23c796df9e163f56f/contract';
import startContract from '../../snapshots/1805657ed4679e2ff58077456dd2a5d47d5aa97edaaa26f23c796df9e163f56f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/6aded3bfabe2b9f5622ad913308b6ad7dc9ab577bb73fcfdea24fafc19fcb1d7/contract';
import endContract from '../../snapshots/6aded3bfabe2b9f5622ad913308b6ad7dc9ab577bb73fcfdea24fafc19fcb1d7/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'order',
        columns: [
          col('amountCents', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('planCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('trainerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('order_planCode_check_82c0dcca', "\"planCode\" IN ('MONTHLY', 'YEARLY')"),
          checkExpression(
            'order_status_check_12cb7312',
            "\"status\" IN ('PENDING', 'PAID', 'REFUSED', 'EXPIRED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'subscription',
        columns: [
          col('activatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('orderId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('planCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('trainerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'subscription_planCode_check_82c0dcca',
            "\"planCode\" IN ('MONTHLY', 'YEARLY')",
          ),
          checkExpression(
            'subscription_status_check_ee520df2',
            "\"status\" IN ('ACTIVE', 'INACTIVE')",
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order',
        index: 'order_trainerId_idx_3e70f981',
        columns: ['trainerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'subscription',
        index: 'subscription_orderId_idx_d284871b',
        columns: ['orderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'subscription',
        index: 'subscription_trainerId_idx_3e70f981',
        columns: ['trainerId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order',
        foreignKey: {
          name: 'order_trainerId_fkey',
          columns: ['trainerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'subscription',
        foreignKey: {
          name: 'subscription_trainerId_fkey',
          columns: ['trainerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'subscription',
        foreignKey: {
          name: 'subscription_orderId_fkey',
          columns: ['orderId'],
          references: { schema: 'public', table: 'order', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
