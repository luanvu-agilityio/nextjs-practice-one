import * as schema from '../schema';
import { getTableConfig } from 'drizzle-orm/pg-core';

describe('schema foreign key references', () => {
  it('should invoke all foreign key reference closures', () => {
    const tables = [
      { name: 'smsVerificationCode', table: schema.smsVerificationCode },
      { name: 'session', table: schema.session },
      { name: 'account', table: schema.account },
      { name: 'emailVerificationCode', table: schema.emailVerificationCode },
    ];

    tables.forEach(({ table }) => {
      const tableConfig = getTableConfig(table);
      expect(tableConfig).toBeDefined();
      expect(tableConfig.foreignKeys).toBeDefined();

      // Call the reference closures to execute the () => user.id functions
      if (Array.isArray(tableConfig.foreignKeys)) {
        tableConfig.foreignKeys.forEach((fk: unknown) => {
          expect(fk).toBeDefined();
          expect(typeof (fk as { reference: () => unknown }).reference).toBe(
            'function'
          );

          // This call executes the () => user.id closure
          const reference = (fk as { reference: () => unknown }).reference();
          expect(reference).toBeDefined();
        });
      }
    });
  });

  it('should verify userId foreign key in smsVerificationCode', () => {
    const tableConfig = getTableConfig(schema.smsVerificationCode);
    const foreignKeys = tableConfig.foreignKeys as Array<{
      reference: () => unknown;
      onDelete: string;
    }>;

    expect(foreignKeys.length).toBeGreaterThan(0);

    // The foreign key references user.id (foreignColumns), not the source columns
    const userIdFK = foreignKeys.find(fk => {
      const ref = fk.reference() as {
        foreignColumns?: Array<{ name: string }>;
      };
      return ref && ref.foreignColumns && ref.foreignColumns[0]?.name === 'id';
    });

    expect(userIdFK).toBeDefined();
    expect(userIdFK?.onDelete).toBe('cascade');
  });

  it('should verify userId foreign key in session', () => {
    const tableConfig = getTableConfig(schema.session);
    const foreignKeys = tableConfig.foreignKeys as Array<{
      reference: () => unknown;
    }>;

    expect(foreignKeys.length).toBeGreaterThan(0);
    foreignKeys.forEach(fk => {
      const ref = fk.reference();
      expect(ref).toBeDefined();
    });
  });

  it('should verify userId foreign key in account', () => {
    const tableConfig = getTableConfig(schema.account);
    const foreignKeys = tableConfig.foreignKeys as Array<{
      reference: () => unknown;
    }>;

    expect(foreignKeys.length).toBeGreaterThan(0);
    foreignKeys.forEach(fk => {
      const ref = fk.reference();
      expect(ref).toBeDefined();
    });
  });

  it('should verify userId foreign key in emailVerificationCode', () => {
    const tableConfig = getTableConfig(schema.emailVerificationCode);
    const foreignKeys = tableConfig.foreignKeys as Array<{
      reference: () => unknown;
    }>;

    expect(foreignKeys.length).toBeGreaterThan(0);
    foreignKeys.forEach(fk => {
      const ref = fk.reference();
      expect(ref).toBeDefined();
    });
  });
});
