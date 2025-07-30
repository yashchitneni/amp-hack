# Office Object Hunt - API Documentation

## Classification API

### Endpoint
`POST /api/classify`

### Purpose
Classifies whether an image contains a specific office object using Gemini 1.5 Pro Vision API.

### Request Format
```typescript
{
  image: string;    // Base64 encoded image (JPEG/PNG)
  itemName: string; // Name of office object to identify
}
```

### Response Format
```typescript
{
  success: boolean;   // True if object is detected, false otherwise
  offline?: boolean;  // Present and true if API failed and fallback was used
}
```

### Integration Example
```typescript
// Frontend usage
const classifyImage = async (imageBase64: string, itemName: string) => {
  const response = await fetch('/api/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      itemName: itemName
    })
  });
  
  const result = await response.json();
  
  if (result.offline) {
    console.log('API unavailable - using offline fallback');
  }
  
  return result.success;
};
```

### Error Handling
- **400**: Missing required fields (image or itemName)
- **500**: Internal server error
- **Offline Fallback**: If Gemini API fails, automatically returns `{ success: true, offline: true }`

### Environment Setup
Set `GEMINI_API_KEY` in Vercel project settings.

### Features
- Automatic image downsampling to 256px for optimal API performance
- 10-second timeout protection
- Graceful offline fallback (auto-pass when API unavailable)
- TypeScript type definitions included
