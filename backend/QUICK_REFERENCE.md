# 📋 Metadata-Driven Wrapper System - Quick Reference Card

## 🚀 Quick Start

### Run Tests
```bash
node backend/tests/testMetadataSystem.js
```

### Apply Migration
```bash
cd backend
npx prisma migrate dev
```

---

## 📝 Format Specification Structure

### Input Format
```json
{
  "paramIndex": 0,
  "paramName": "nums",
  "baseType": "array",
  "elementType": "int",
  "parseStrategy": "json_array",
  "inputFormatExample": "[1,2,3]"
}
```

### Output Format
```json
{
  "baseType": "array",
  "elementType": "int",
  "serializeStrategy": "json_array",
  "outputFormatExample": "[0,1]"
}
```

---

## 🎯 Available Strategies

### Parsing Strategies
- `primitive` - int, long, float, double, boolean, string, char
- `json_array` - Arrays from JSON

### Serialization Strategies
- `primitive` - Single values
- `json_array` - Arrays to JSON

---

## 💻 Code Examples

### Create Question with Metadata
```javascript
const question = {
  inputFormats: [
    {
      paramIndex: 0,
      paramName: "nums",
      baseType: "array",
      elementType: "int",
      parseStrategy: "json_array"
    }
  ],
  outputFormat: {
    baseType: "int",
    serializeStrategy: "primitive"
  }
};
```

### Use Resolver
```javascript
const resolver = require('./FormatSpecificationResolver');
const inputFormats = resolver.resolveInputFormats(question);
const outputFormat = resolver.resolveOutputFormat(question);
```

### Get Strategy
```javascript
const registry = require('./StrategyRegistry');
const strategy = registry.getParsingStrategy('json_array');
const code = strategy.generateCppCode(spec, 'nums', 0);
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `METADATA_WRAPPER_README.md` | Quick start guide |
| `docs/FORMAT_SPECIFICATION_GUIDE.md` | How to create specs |
| `docs/METADATA_WRAPPER_IMPLEMENTATION.md` | Implementation details |
| `.agent/workflows/metadata-driven-wrapper-implementation.md` | Full roadmap |
| `IMPLEMENTATION_SUMMARY.md` | Complete summary |

---

## 🔧 Key Files Created

### Models
- `src/models/formatSpecification/InputFormatSpec.js`
- `src/models/formatSpecification/OutputFormatSpec.js`

### Services
- `src/services/wrapperGeneration/FormatSpecificationResolver.js`
- `src/services/wrapperGeneration/StrategyRegistry.js`

### Strategies
- `src/services/wrapperGeneration/strategies/base/ParsingStrategy.js`
- `src/services/wrapperGeneration/strategies/base/SerializationStrategy.js`
- `src/services/wrapperGeneration/strategies/parsing/PrimitiveParsingStrategy.js`
- `src/services/wrapperGeneration/strategies/parsing/JsonArrayParsingStrategy.js`
- `src/services/wrapperGeneration/strategies/serialization/PrimitiveSerializationStrategy.js`
- `src/services/wrapperGeneration/strategies/serialization/JsonArraySerializationStrategy.js`

### Tests
- `tests/testMetadataSystem.js`

---

## ✅ Status

| Component | Status |
|-----------|--------|
| Database Schema | ✅ Complete |
| Base Strategies | ✅ Complete |
| Primitive Strategies | ✅ Complete |
| Array Strategies | ✅ Complete |
| Strategy Registry | ✅ Complete |
| Format Models | ✅ Complete |
| Resolver | ✅ Complete |
| Tests | ✅ Passing |
| Documentation | ✅ Complete |

---

## 🎯 Next Steps

1. ⏳ Implement remaining strategies (trees, graphs, matrices)
2. ⏳ Refactor WrapperGenerator to use strategies
3. ⏳ Update language-specific generators
4. ⏳ Add custom type system
5. ⏳ Create migration tools

---

## 🐛 Troubleshooting

### Strategy Not Found
```javascript
const registry = require('./StrategyRegistry');
console.log(registry.getStrategyInfo());
```

### Validation Fails
```javascript
const validation = resolver.validateFormatSpecifications(question);
console.log(validation.errors);
```

### Test Legacy Conversion
```javascript
const spec = InputFormatSpec.fromLegacyType('array<int>', 0, 'nums');
console.log(spec.toJSON());
```

---

## 📞 Quick Links

- **Main README:** `backend/METADATA_WRAPPER_README.md`
- **Format Guide:** `backend/docs/FORMAT_SPECIFICATION_GUIDE.md`
- **Implementation:** `backend/docs/METADATA_WRAPPER_IMPLEMENTATION.md`
- **Summary:** `IMPLEMENTATION_SUMMARY.md`

---

**Last Updated:** 2026-01-25  
**Version:** 1.0.0  
**Status:** ✅ Foundation Complete
