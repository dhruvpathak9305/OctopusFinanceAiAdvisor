# 🐛 Bug Fix: Maximum Update Depth Exceeded

**Issue:** Infinite loop in `useMarketData` hook causing app crash  
**Date:** November 14, 2025  
**Status:** ✅ Fixed

---

## 🔴 The Problem

### Error Message
```
ERROR Maximum update depth exceeded. This can happen when a component 
calls setState inside useEffect, but useEffect either doesn't have a 
dependency array, or one of the dependencies changes on every render.
```

### Root Cause

The infinite loop was caused by **dependency array issues** in the React hooks:

#### 1. **Array Reference Problem**
```typescript
// ❌ BEFORE (Broken)
const symbols = holdings.filter(h => h.asset_type === 'stock').map(h => h.symbol);
const { marketStatus } = useMarketData(symbols, true);

const fetchQuotes = useCallback(async () => {
  // ... fetch logic
}, [symbols, enabled]); // ⚠️ 'symbols' is a new array on every render!

useEffect(() => {
  fetchQuotes();
  fetchMarketStatus();
}, [fetchQuotes, fetchMarketStatus]); // ⚠️ These change on every render!
```

**What happened:**
1. Parent component renders and creates a NEW `symbols` array
2. `symbols` array reference changes (even if content is same)
3. `fetchQuotes` callback is recreated due to new `symbols` dependency
4. `useEffect` detects `fetchQuotes` changed, runs again
5. Sets state, triggers re-render
6. Back to step 1 → **Infinite loop!** 🔄

#### 2. **useEffect Dependency Chain**
```typescript
// ❌ BEFORE (Broken)
useEffect(() => {
  fetchQuotes();
  fetchMarketStatus();
}, [fetchQuotes, fetchMarketStatus]); // These change because symbols changed
```

Every render created new callback references, triggering the effect repeatedly.

---

## ✅ The Solution

### Fix 1: Serialize Array Dependencies
```typescript
// ✅ AFTER (Fixed)
const symbolsKey = symbols.join(','); // Convert array to string

const fetchQuotes = useCallback(async () => {
  // ... fetch logic
}, [symbolsKey, enabled]); // Use stable string instead of array
```

**Why this works:**
- `symbolsKey` only changes when array **content** changes
- Same symbols = same string = same callback = no infinite loop!

### Fix 2: Track Initial Fetch with useRef
```typescript
// ✅ AFTER (Fixed)
const initialFetchDone = useRef(false);

useEffect(() => {
  if (!initialFetchDone.current) {
    fetchQuotes();
    fetchMarketStatus();
    initialFetchDone.current = true;
  }
}, []); // Empty array - run ONLY once
```

**Why this works:**
- Ref persists across renders without causing re-renders
- Initial fetch happens only once
- No dependency on changing callbacks

### Fix 3: Stable Callback for Intervals
```typescript
// ✅ AFTER (Fixed)
useEffect(() => {
  if (!enabled || !marketStatus?.isOpen) return;

  const interval = setInterval(() => {
    fetchQuotes(); // Call directly, not as reference
  }, 30000);

  return () => clearInterval(interval);
}, [enabled, marketStatus?.isOpen, fetchQuotes]); // Stable dependencies
```

---

## 📝 Changes Made

### File: `hooks/useMarketData.ts`

#### Changed 1: Added useRef import
```diff
- import { useState, useEffect, useCallback } from 'react';
+ import { useState, useEffect, useCallback, useRef } from 'react';
```

#### Changed 2: Added serialization and ref
```diff
+ const initialFetchDone = useRef(false);
+ const symbolsKey = symbols.join(',');
```

#### Changed 3: Updated fetchQuotes dependencies
```diff
  const fetchQuotes = useCallback(async () => {
    // ... logic
- }, [symbols, enabled]);
+ }, [symbolsKey, enabled]); // Use symbolsKey instead of symbols array
```

#### Changed 4: Made initial fetch run once
```diff
- useEffect(() => {
-   fetchQuotes();
-   fetchMarketStatus();
- }, [fetchQuotes, fetchMarketStatus]);

+ useEffect(() => {
+   if (!initialFetchDone.current) {
+     fetchQuotes();
+     fetchMarketStatus();
+     initialFetchDone.current = true;
+   }
+ }, []); // Empty dependency array - run only once
```

### Files: `hooks/usePortfolio.ts` & `hooks/useIPO.ts`

Added eslint-disable comments to suppress warnings for intentionally empty dependency arrays:

```typescript
useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Run only once on mount
```

---

## 🎯 Key Takeaways

### The Problem Pattern
```typescript
// ❌ DON'T DO THIS
const arrayProp = someArray.map(...);
const callback = useCallback(() => {
  // uses arrayProp
}, [arrayProp]); // arrayProp is new on every render!

useEffect(() => {
  callback();
}, [callback]); // callback changes on every render!
```

### The Solution Pattern
```typescript
// ✅ DO THIS INSTEAD
const arrayKey = someArray.join(','); // or JSON.stringify
const callback = useCallback(() => {
  // uses original array
}, [arrayKey]); // arrayKey only changes when content changes

// OR use empty dependencies for mount-only effects
const mounted = useRef(false);
useEffect(() => {
  if (!mounted.current) {
    callback();
    mounted.current = true;
  }
}, []); // Runs once
```

---

## 🧪 How to Test the Fix

### Before Fix
```
❌ App crashes with "Maximum update depth exceeded"
❌ Console floods with error messages
❌ Portfolio screen doesn't load
```

### After Fix
```
✅ App loads successfully
✅ Portfolio screen displays
✅ Market data fetches once on mount
✅ Auto-refresh works during market hours
✅ No infinite loops
```

---

## 📚 Learn More

### React Hooks Rules
1. **useCallback dependencies** - Only include values that change the callback behavior
2. **useEffect dependencies** - Include all values used inside the effect
3. **Array dependencies** - Convert to stable values (string, number) if content matters
4. **Ref pattern** - Use refs for values that shouldn't trigger re-renders

### Common Mistakes to Avoid
1. ❌ Using object/array literals in dependency arrays
2. ❌ Not serializing array dependencies
3. ❌ Including unstable callback references
4. ❌ Missing dependencies (leads to stale closures)
5. ❌ Too many dependencies (leads to infinite loops)

### Best Practices
1. ✅ Serialize arrays/objects when used as dependencies
2. ✅ Use refs for values that don't need to trigger renders
3. ✅ Use empty dependency arrays for mount-only effects
4. ✅ Wrap callbacks in useCallback with stable dependencies
5. ✅ Test hooks in isolation to catch infinite loops early

---

## ✅ Status

**Fixed in:**
- `hooks/useMarketData.ts` ✅
- `hooks/usePortfolio.ts` ✅
- `hooks/useIPO.ts` ✅

**Verified:**
- No more infinite loops ✅
- App loads successfully ✅
- Market data fetches correctly ✅
- Performance improved ✅

---

**The portfolio system is now stable and ready for use!** 🚀

