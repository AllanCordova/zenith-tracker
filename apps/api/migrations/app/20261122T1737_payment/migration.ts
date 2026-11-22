#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6aded3bfabe2b9f5622ad913308b6ad7dc9ab577bb73fcfdea24fafc19fcb1d7/contract';
import startContract from '../../snapshots/6aded3bfabe2b9f5622ad913308b6ad7dc9ab577bb73fcfdea24fafc19fcb1d7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a3e05625566c912742eeb7bff814d7be2a43c6815ec52e1bb2bd9b76339aaa0f/contract';
import endContract from '../../snapshots/a3e05625566c912742eeb7bff814d7be2a43c6815ec52e1bb2bd9b76339aaa0f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'payment',
        columns: [
          col('gatewayPaymentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('orderId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('receivedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'payment',
        index: 'payment_orderId_idx_d284871b',
        columns: ['orderId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'payment',
        foreignKey: {
          name: 'payment_orderId_fkey',
          columns: ['orderId'],
          references: { schema: 'public', table: 'order', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
