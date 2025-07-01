# Onboarding A/B Test: Blockers & Frequency Screens

## Overview

This document describes the implementation of an A/B test for the onboarding flow using LaunchDarkly's experimentation feature combined with Mixpanel analytics.

**Test Hypothesis**: Removing the blockers and frequency screens from onboarding will increase completion rates.

### Test Variants
- **Test A (Control)**: Show blockers and frequency screens (current behavior)
- **Test B (Treatment)**: Skip blockers and frequency screens entirely

## Implementation Summary

Your approach using LaunchDarkly + Mixpanel is **optimal** because:

1. **LaunchDarkly Experimentation**:
   - Handles automatic user bucketing with statistical rigor
   - Provides real-time statistical significance calculations
   - Offers built-in experiment management and targeting
   - Includes confidence intervals and credible intervals

2. **Mixpanel Analytics**:
   - Enables detailed funnel analysis
   - Provides rich user behavior insights
   - Allows custom cohort analysis and segmentation
   - Offers powerful visualization capabilities

3. **Combined Benefits**:
   - LaunchDarkly manages experiment logic and statistical analysis
   - Mixpanel provides deep behavioral insights and custom analytics
   - Dual tracking ensures data redundancy and comprehensive analysis

## Code Changes Made

### 1. LaunchDarkly Service Enhancement
**File**: `src/lib/launchdarkly.ts`
- Added `ExperimentService` with flag checking logic
- Implemented proper user identification for experiments
- Added flag constant: `SKIP_BLOCKERS_FREQUENCY = 'skip-blockers-frequency-screens'`

### 2. Analytics Enhancement
**File**: `src/lib/analytics.ts`
- Added general experiment participation tracking
- Added specific events for blockers/frequency test variants
- Enhanced event metadata for better analysis

### 3. Routing Logic Implementation
**File**: `src/app/(onboarding)/goal.tsx`
- Integrated A/B test logic in the goal screen's continue handler
- Added user bucketing based on LaunchDarkly flag
- Implemented conditional routing (blockers vs avoid-setbacks)
- Added analytics tracking for both variants
- Set default values for skipped screens to prevent validation issues

## LaunchDarkly Setup Instructions

### Step 1: Create Feature Flag
1. Navigate to LaunchDarkly dashboard
2. Create new boolean feature flag:
   - **Key**: `skip-blockers-frequency-screens`
   - **Name**: "Skip Blockers & Frequency Screens"
   - **Default**: `false` (show screens)

### Step 2: Create Experiment
1. Go to Experiments section
2. Click "Create Experiment"
3. Configure:
   - **Name**: "Onboarding Blockers & Frequency Skip Test"
   - **Flag**: `skip-blockers-frequency-screens`
   - **Hypothesis**: "Removing blockers and frequency screens increases completion rates"
   - **Variations**: 
     - Control (`false`): Show screens
     - Treatment (`true`): Skip screens
   - **Split**: 50/50 or as desired

### Step 3: Configure Metrics
Set up metrics to track in LaunchDarkly:
- **Primary**: Custom conversion events
  - `onboarding_completed`
  - `subscription_purchased`
- **Secondary**: Flag evaluation events (automatic)

### Step 4: Launch
1. Configure targeting (if needed)
2. Turn on the flag
3. Start experiment

## Analytics Events

### LaunchDarkly (Automatic)
- Flag evaluation events
- Experiment participation
- Conversion events (when configured)

### Mixpanel (Custom)
- `experiment_participation`
- `onboarding_blockers_frequency_skipped` (Test B)
- `onboarding_blockers_frequency_shown` (Test A)
- `onboarding_completed` (primary metric)

## Flow Changes

### Current Flow (Test A)
```
goal → blockers → frequency → avoid-setbacks → ...
```

### New Flow (Test B)
```
goal → avoid-setbacks → ...
(blockers & frequency skipped with defaults set)
```

## Monitoring Strategy

### Key Metrics
1. **Primary**: Onboarding completion rate
2. **Secondary**: 
   - Time to complete onboarding
   - Sign-up conversion rate
   - Subscription conversion rate
   - Drop-off points

### Analysis Approach
1. **Statistical Significance**: Wait for LaunchDarkly to show significance
2. **Behavioral Analysis**: Use Mixpanel for detailed user journey analysis
3. **Segmentation**: Analyze by device type, traffic source, demographics
4. **Duration**: Run for 1-2 weeks minimum for reliable results

## Expected Results

### If Test B Wins (Skip Screens)
- **Immediate**: Remove screens permanently
- **Follow-up**: Test removing other screens
- **Insight**: Shorter onboarding increases completion

### If Test A Wins (Keep Screens)
- **Immediate**: Keep current flow
- **Follow-up**: Optimize existing screens
- **Insight**: Information gathering is valuable to users

## Alternative Approaches Considered

1. **Client-side only A/B testing**: Less robust, no statistical analysis
2. **Mixpanel-only experiments**: Requires custom bucketing logic
3. **Google Optimize**: Would require additional integration
4. **Custom solution**: Significant development overhead

**Conclusion**: LaunchDarkly + Mixpanel provides the best balance of statistical rigor, ease of implementation, and analytical depth.

## Implementation Checklist

- [x] LaunchDarkly service integration
- [x] Analytics event tracking
- [x] Routing logic implementation
- [x] Default value handling
- [x] LaunchDarkly flag creation
- [x] Experiment configuration
- [x] Testing in development
- [x] Production deployment
- [ ] Monitoring setup

## Troubleshooting

### Common Issues
1. **Flag not evaluating**: Check client initialization and network
2. **Users not properly bucketed**: Verify user identification
3. **Analytics not firing**: Check event payload and Mixpanel setup
4. **Inconsistent routing**: Verify flag key matches exactly

### Debug Mode
Enable in development environment for detailed logging:
```typescript
debug: appVariant === 'development'
``` 