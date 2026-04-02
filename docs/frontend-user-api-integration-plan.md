# frontend-user API Integration Plan

## 1. Background

The current `frontend-user` application is primarily composed of static design-driven pages. The visual presentation is already in place for key user journeys, but most pages are still powered by mock data or hardcoded placeholder content rather than real backend APIs.

This creates a gap between the current UI prototype and a usable business application. To move the project forward, `frontend-user` needs to transition from static presentation pages to functional pages backed by the existing backend services in `group-buy-market-master/`.

This document defines the first-stage implementation plan for that transition. It focuses on aligning the frontend page flows, request strategy, and phased rollout order with the backend interfaces that already exist.

---

## 2. Goal

The goal of this effort is to make `frontend-user` a real business frontend by progressively replacing static data with backend-integrated functionality.

This includes:

- connecting core user-facing pages to real backend APIs
- establishing a consistent request/service integration pattern
- defining how page state should map to backend response models
- prioritizing the most important business journeys first
- avoiding one-off page rewrites that do not fit a broader integration strategy

---

## 3. Scope

### In scope

The first implementation stage should focus on the core user journey pages:

- login page
- homepage
- goods detail page
- order list page
- profile / user center page

This stage should also establish reusable frontend integration conventions for:

- request wrappers
- service-layer API calls
- response handling
- empty/loading/error state behavior
- DTO-to-view-model mapping where needed

### Out of scope for this stage

The following items are not the primary goal of this document:

- redesigning page visuals from scratch
- large-scale UI refactoring beyond what is required for API integration
- speculative abstractions for pages that are not yet being implemented
- backend feature redesign where the existing interface already satisfies the business need

---

## 4. Current State Summary

The current `frontend-user` codebase shows the following characteristics:

- multiple route pages are implemented as static design drafts
- some earlier real-data logic exists only as commented-out code
- some pages are visually polished but not functionally connected
- auth state already exists in a Pinia store and local storage
- request modules already exist and can be extended

This means the project is not starting from zero. The right approach is not to rebuild the app, but to incrementally replace mock presentation logic with business-backed data flows.

---

## 5. Implementation Principles

The following rules should guide all `frontend-user` integration work.

### 5.1 Keep page visuals when possible

If a page already has an acceptable visual design, prefer preserving the layout and replacing only the data source and interaction logic.

### 5.2 Use backend APIs through request/service layers

Pages should not embed raw request details directly. The preferred layering is:

- `request/*` handles shared HTTP configuration
- `services/*` or feature-oriented request modules define backend API calls
- `pages/*` manage UI state and user interactions

### 5.3 Avoid static mock data in production page logic

Design-time fake arrays and hardcoded business records should be removed or isolated once real API integration begins.

### 5.4 Respect backend request semantics

Frontend state and request construction must follow backend parameter legality rules. The frontend should prevent invalid combinations instead of relying on backend rejection alone.

### 5.5 Deliver page-by-page, not all-at-once

The application should be migrated in prioritized slices. Each page should become fully functional before moving to the next major page.

---

## 6. Homepage Integration Plan

The homepage is the first recommended business page to land because it is the main entry point for product discovery.

### 6.1 Homepage target

The homepage should stop using static product cards and instead load marketed goods from backend APIs.

### 6.2 Primary goods API

The homepage should use:

- `queryMarketGoodsPage(...)`

This API is the correct first-choice API for a homepage-style marketed goods list.

### 6.3 Initial load behavior

On `onMounted`, the homepage should immediately request:

- `queryMarketGoodsPage(...)`

with:

- `userId`
- default pagination fields
- no `source`
- no `channel`

This means the homepage initially shows all eligible marketed goods rather than waiting for filter metadata first.

### 6.4 Source dropdown behavior

The source filter should be implemented as a dropdown with default value:

- `全部`

The homepage should not request source options during initial page load. Instead:

- when the user first opens the source dropdown, call `querySourceList()`
- cache the result locally for reuse during the same page session

Frontend handling rules:

- default option should represent “all sources”
- when “all sources” is selected, the frontend should omit `source` from marketed-goods requests, or pass no effective value

### 6.5 Channel dropdown behavior

The channel filter depends on the selected source.

Rules:

- before a concrete source is selected, channel dropdown should display `请选择来源`
- before a concrete source is selected, do not call `queryChannelListBySource(...)`
- after a source is selected, call `queryChannelListBySource(source)`
- when source changes, reset channel selection and reload channel options

Recommended behavior:

- default channel value should be empty / unselected until a source exists
- after a source is selected, the first channel option may be `全部渠道`

### 6.6 Request legality rules

The frontend must follow backend legality constraints:

- source empty + channel empty: legal
- source present + channel empty: legal
- source present + channel present: legal
- source empty + channel present: illegal

Therefore the homepage must never send a channel-only request.

### 6.7 Homepage state model

Suggested state fields:

- `goodsList`
- `loading`
- `loadingMore`
- `page`
- `pageSize`
- `total`
- `sourceOptions`
- `channelOptions`
- `sourceOptionsLoaded`
- `channelOptionsLoadedFor`
- `selectedSource`
- `selectedChannel`

### 6.8 Homepage update triggers

The homepage goods list should refresh when:

- page first loads
- selected source changes
- selected channel changes
- pagination requests the next page

When source changes:

1. clear selected channel
2. clear channel options
3. load channel options if source is concrete
4. reload goods list from page 1

When channel changes:

1. reload goods list from page 1

---

## 7. Other Page Rollout Priorities

After the homepage, the recommended landing order is below.

### 7.1 Login page

The login page should complete the real authentication flow and persist valid auth state into the existing store.

### 7.2 Goods detail page

The detail page should load real goods/business detail data and support the real purchase/join-group flow prerequisites.

### 7.3 Orders page

The orders page should display real user order records, statuses, and drill-down navigation.

### 7.4 Profile page

The profile page should display real user identity and relevant user-side operational data.

### 7.5 Remaining static pages

Any remaining static design pages should be reviewed one by one and categorized as:

- immediately integratable with existing backend APIs
- blocked by missing backend capability
- visually complete but functionally low priority

---

## 8. Recommended Frontend Structure

To keep implementation maintainable, the following responsibility split should be used.

### 8.1 Request layer

Shared Axios instances remain in `src/request/*`.

Responsibilities:

- base URL management
- auth header injection
- response normalization
- 401 handling

### 8.2 Service layer

Feature-oriented API wrappers should define typed request functions for user-facing business capabilities.

Examples:

- goods/homepage market query
- source option query
- channel option query
- order query
- profile query

### 8.3 Page layer

Route pages should own:

- loading states
- filter states
- user-triggered refresh logic
- view formatting needed by the template

Pages should not duplicate low-level transport logic.

---

## 9. Data Mapping Guidance

Because some pages were designed from visual mockups first, backend response fields may not match the current display model one-to-one.

For that reason:

- simple direct fields can be used directly in templates
- display-only derived values should be computed in the page layer
- if repeated mapping logic appears across multiple pages, extract it only after duplication becomes real

Avoid creating speculative adapter layers too early.

---

## 10. Error / Empty / Loading States

Every integrated page should explicitly handle:

- loading state
- empty state
- backend error state
- unauthorized state via existing auth flow

Recommended rules:

- show loading feedback during first fetch
- show empty-state UI when no business data is returned
- show request failure feedback with backend `info` where available
- rely on shared request handling for 401 redirect behavior

---

## 11. Phased Delivery Plan

### Phase 1: Integration foundation

- confirm backend interfaces per page
- add missing frontend request/service wrappers
- define per-page request state model
- remove or isolate fake data from target pages

### Phase 2: Homepage landing

- integrate `queryMarketGoodsPage(...)`
- add lazy-loaded source dropdown
- add source-dependent channel dropdown
- replace static homepage product cards with real backend data

### Phase 3: Core user journey landing

- login
- goods detail
- orders
- profile

### Phase 4: Cleanup and consistency

- remove dead mock code
- align request/response typing
- normalize loading and error handling patterns
- identify remaining static pages for later integration

---

## 12. Suggested Next Steps

The recommended immediate next actions are:

1. confirm this plan as the working implementation document
2. implement homepage integration first as the initial functional slice
3. create concrete development tasks for homepage request wrappers, dropdown state handling, and goods rendering replacement
4. after homepage is stable, move to login and goods detail

---

## 13. Definition of Success

This first-stage effort is successful when:

- homepage loads real marketed goods from backend APIs
- source/channel filters behave according to backend rules
- key user pages start consuming real backend data instead of hardcoded mock data
- the frontend follows a repeatable integration structure for future pages

---

## 14. Open Questions

The following questions may need confirmation during implementation:

- which pages already have backend-ready endpoints and which still require backend completion
- whether homepage should support infinite scroll, manual load more, or fixed pagination UI
- whether source/channel options should be cached only in-memory or also persisted locally
- whether some current design-only sections should remain decorative in the first release
