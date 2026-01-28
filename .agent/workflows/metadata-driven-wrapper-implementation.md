---
description: Metadata-Driven Dynamic Wrapper Generation System Implementation
---

# Metadata-Driven Dynamic Wrapper Generation System

## Implementation Roadmap

This workflow guides the implementation of the metadata-driven wrapper generation system as outlined in the technical design document.

---

## Phase 1: Database Schema Extensions

### Step 1.1: Extend Question Model with Format Metadata

Update `backend/prisma/schema.prisma` to add new fields to the Question model:

```prisma
model Question {
  // ... existing fields ...
  
  // New metadata fields for dynamic wrapper generation
  inputFormats  Json?  // Array of input format specifications
  outputFormat  Json?  // Output format specification
  customTypes   Json?  // Custom type definitions
  
  // ... existing relations ...
}
```

### Step 1.2: Create Migration

```bash
cd backend
npx prisma migrate dev --name add_format_metadata
```

---

## Phase 2: Strategy System Implementation

### Step 2.1: Create Strategy Base Classes

Create `backend/src/services/wrapperGeneration/strategies/base/`:
- `ParsingStrategy.js` - Base class for all parsing strategies
- `SerializationStrategy.js` - Base class for all serialization strategies

### Step 2.2: Implement Parsing Strategies

Create `backend/src/services/wrapperGeneration/strategies/parsing/`:
- `PrimitiveParsingStrategy.js`
- `JsonArrayParsingStrategy.js`
- `JsonObjectParsingStrategy.js`
- `ArrayOfObjectsParsingStrategy.js`
- `NestedArrayParsingStrategy.js`
- `SpaceSeparatedParsingStrategy.js`
- `RegexCustomParsingStrategy.js`

### Step 2.3: Implement Serialization Strategies

Create `backend/src/services/wrapperGeneration/strategies/serialization/`:
- `PrimitiveSerializationStrategy.js`
- `JsonArraySerializationStrategy.js`
- `JsonObjectSerializationStrategy.js`
- `CustomObjectSerializationStrategy.js`

### Step 2.4: Create Strategy Registry

Create `backend/src/services/wrapperGeneration/StrategyRegistry.js`:
- Centralized registry for all strategies
- Maps strategy names to implementations
- Supports dynamic strategy registration

---

## Phase 3: Format Specification System

### Step 3.1: Create Format Specification Models

Create `backend/src/models/formatSpecification/`:
- `InputFormatSpec.js` - Input parameter format descriptor
- `OutputFormatSpec.js` - Output format descriptor
- `CustomTypeDefinition.js` - Custom type definition model

### Step 3.2: Create Format Resolver

Create `backend/src/services/wrapperGeneration/FormatSpecificationResolver.js`:
- Resolves format specifications from metadata
- Validates format specifications
- Provides default specs for backward compatibility

---

## Phase 4: Dynamic Wrapper Generator Refactoring

### Step 4.1: Refactor WrapperGenerator Base Class

Update `backend/src/services/wrapperGeneration/WrapperGenerator.js`:
- Remove hardcoded type parsing logic
- Integrate with StrategyRegistry
- Use FormatSpecificationResolver
- Maintain backward compatibility

### Step 4.2: Update Language-Specific Generators

Update all language generators to use strategies:
- `CppWrapperGenerator.js`
- `JavaWrapperGenerator.js`
- `PythonWrapperGenerator.js`
- `JavaScriptWrapperGenerator.js`

Remove hardcoded parsing/serialization logic and delegate to strategies.

---

## Phase 5: Backward Compatibility Layer

### Step 5.1: Create Legacy Format Adapter

Create `backend/src/services/wrapperGeneration/LegacyFormatAdapter.js`:
- Converts legacy type definitions to format specifications
- Maps old type strings to default strategies
- Ensures existing questions work without changes

### Step 5.2: Integrate Adapter into Generator

Update `WrapperGenerator.generate()` to:
1. Check if format metadata exists
2. If not, use LegacyFormatAdapter to infer specs
3. Proceed with strategy-based generation

---

## Phase 6: Validation System

### Step 6.1: Create Format Validators

Create `backend/src/validators/`:
- `InputFormatValidator.js` - Validates input format specs
- `OutputFormatValidator.js` - Validates output format specs
- `CustomTypeValidator.js` - Validates custom type definitions
- `TestCaseFormatValidator.js` - Validates test cases against format specs

### Step 6.2: Integrate Validation into Controllers

Update controllers to validate format metadata:
- Question creation/update
- Test case creation/update
- Wrapper generation

---

## Phase 7: Test Case Consistency Enforcement

### Step 7.1: Create Test Case Validator Service

Create `backend/src/services/TestCaseValidationService.js`:
- Validates test case inputs against input format specs
- Validates test case outputs against output format specs
- Provides detailed error messages

### Step 7.2: Add Validation Hooks

Add validation to:
- Test case creation endpoint
- Test case update endpoint
- Bulk test case import

---

## Phase 8: Custom Type System

### Step 8.1: Create Custom Type Manager

Create `backend/src/services/wrapperGeneration/CustomTypeManager.js`:
- Manages custom type definitions
- Generates language-specific class/struct templates
- Handles nested custom types

### Step 8.2: Integrate with Generators

Update language generators to:
- Inject custom type definitions
- Use custom types in parsing/serialization
- Handle custom type dependencies

---

## Phase 9: Error Handling & Diagnostics

### Step 9.1: Create Error Classes

Create `backend/src/errors/wrapperGeneration/`:
- `FormatSpecificationError.js`
- `StrategyNotFoundError.js`
- `ValidationError.js`
- `CustomTypeError.js`

### Step 9.2: Implement Diagnostic System

Create `backend/src/services/wrapperGeneration/DiagnosticService.js`:
- Provides detailed error messages
- References metadata, not internal code
- Suggests fixes for common issues

---

## Phase 10: Testing & Validation

### Step 10.1: Create Comprehensive Test Suite

Create tests in `backend/tests/wrapperGeneration/`:
- `strategies.test.js` - Test all strategies
- `formatSpecification.test.js` - Test format specs
- `customTypes.test.js` - Test custom types
- `backwardCompatibility.test.js` - Test legacy support
- `validation.test.js` - Test validation system
- `integration.test.js` - End-to-end tests

### Step 10.2: Test Migration of Existing Questions

Create `backend/scripts/testMetadataMigration.js`:
- Test all existing questions work with new system
- Verify backward compatibility
- Generate migration report

---

## Phase 11: Migration Tools

### Step 11.1: Create Migration Script

Create `backend/scripts/migrateToMetadataFormat.js`:
- Analyzes existing questions
- Generates format specifications
- Updates database with metadata
- Validates migrated questions

### Step 11.2: Create Validation Script

Create `backend/scripts/validateMetadataFormat.js`:
- Validates all format specifications
- Checks test case consistency
- Generates validation report

---

## Phase 12: Documentation

### Step 12.1: Create Developer Documentation

Create `backend/docs/`:
- `WRAPPER_GENERATION_ARCHITECTURE.md` - System architecture
- `FORMAT_SPECIFICATION_GUIDE.md` - How to define formats
- `CUSTOM_TYPES_GUIDE.md` - How to use custom types
- `STRATEGY_DEVELOPMENT_GUIDE.md` - How to add new strategies
- `MIGRATION_GUIDE.md` - How to migrate existing questions

### Step 12.2: Create API Documentation

Document new endpoints and request/response formats for:
- Format specification management
- Custom type management
- Validation endpoints

---

## Phase 13: Admin UI (Future Enhancement)

### Step 13.1: Format Specification Builder

Create frontend components for:
- Visual format specification builder
- Custom type editor
- Test case format validator

### Step 13.2: Migration Tools UI

Create admin interface for:
- Viewing migration status
- Manually adjusting format specs
- Validating questions

---

## Testing Checklist

- [ ] All existing questions work unchanged
- [ ] New custom formats work via metadata only
- [ ] No hardcoded parsing logic exists
- [ ] All languages behave consistently
- [ ] Validation catches all format errors
- [ ] Test cases are validated against specs
- [ ] Error messages are clear and actionable
- [ ] Performance is acceptable
- [ ] Backward compatibility is maintained

---

## Success Criteria

✅ System is complete when:
1. All existing questions work without changes
2. New custom formats require metadata only
3. No hardcoded parsing logic exists in generators
4. All languages behave consistently
5. Validation is comprehensive and helpful
6. Migration path is clear and tested

---

## Notes

- Maintain backward compatibility throughout
- Test extensively before deploying
- Document all changes
- Provide clear migration path
- Focus on extensibility and maintainability
