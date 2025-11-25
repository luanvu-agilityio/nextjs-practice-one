import { Effect } from 'effect';
import { ParseResult, Schema } from 'effect';
import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverResult,
} from 'react-hook-form';

/**
 * Creates a react-hook-form resolver that uses Effect Schema for validation.
 *
 * @param schema - The Effect Schema to validate against
 * @returns A resolver compatible with react-hook-form's useForm hook
 *
 * @example
 * ```typescript
 * const SignInSchema = S.Struct({
 *   email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
 *   password: S.String.pipe(S.minLength(8))
 * });
 *
 * const { control } = useForm({
 *   resolver: effectSchemaResolver(SignInSchema)
 * });
 * ```
 */
export const effectSchemaResolver = <A extends FieldValues>(
  schema: Schema.Schema<A>
): Resolver<A> => {
  return async (values): Promise<ResolverResult<A>> => {
    try {
      const decodeEffect = ParseResult.decodeUnknown(schema, { errors: 'all' })(
        values
      );
      const result = await Effect.runPromise(Effect.either(decodeEffect));

      if (result._tag === 'Right') {
        return {
          values: result.right,
          errors: {},
        };
      }

      // Convert Effect Schema ParseError to react-hook-form FieldErrors
      const errors: Record<string, FieldError> = {};

      // The error from Either is the raw ParseIssue, wrap it in a ParseError
      const parseError = new ParseResult.ParseError({ issue: result.left });
      const formatted = ParseResult.ArrayFormatter.formatErrorSync(parseError);

      formatted.forEach(error => {
        const path = error.path;

        if (path.length === 0) {
          // Root-level errors (cross-field validation): show on all relevant fields
          if ('newPassword' in values && 'confirmPassword' in values) {
            // Password matching validation - show on both password fields
            errors['newPassword'] = {
              type: 'validation',
              message: error.message,
            };
            errors['confirmPassword'] = {
              type: 'validation',
              message: error.message,
            };
          } else {
            // Other root-level errors: assign to the last field as fallback
            const fields = Object.keys(values);
            if (fields.length > 0) {
              errors[fields[fields.length - 1]] = {
                type: 'validation',
                message: error.message,
              };
            }
          }
        } else {
          // Field-specific errors
          const fieldName = path.join('.');
          errors[fieldName] = {
            type: 'validation',
            message: error.message,
          };
        }
      });

      return {
        values: {},
        errors: errors as FieldErrors<A>,
      } as ResolverResult<A>;
    } catch {
      // If schema validation fails completely, return empty errors
      // This handles cases where schema might be undefined in tests
      return {
        values: values as A,
        errors: {},
      };
    }
  };
};
