# Requirements Document

## Introduction

This document specifies the requirements for completely removing the payment functionality from the Ghost publishing platform. The payment feature is deeply integrated across the codebase including Stripe integration, subscription management, product/tier management, donation handling, and related frontend UI components. This removal must be done systematically to avoid breaking the application while preserving core member functionality.

## Key Components to Remove

Based on the actual Ghost codebase structure:

**Services:**
- `ghost/core/core/server/services/stripe/` - Stripe integration service
- `ghost/core/core/server/services/offers/` - Offers/promotions service
- `ghost/core/core/server/services/tiers/` - Tiers/products service
- `ghost/core/core/server/services/donations/` - Donations service

**Models:**
- `member-payment-event.js` - Payment event tracking
- `member-stripe-customer.js` - Stripe customer linkage
- `stripe-customer-subscription.js` - Subscription records
- `stripe-price.js` - Stripe pricing
- `stripe-product.js` - Stripe products
- `donation-payment-event.js` - Donation records
- `offer.js` - Promotional offers
- `offer-redemption.js` - Offer usage tracking
- `member-paid-subscription-event.js` - Paid subscription events

**API Endpoints:**
- `offers.js`, `offers-public.js` - Offers API
- `tiers.js`, `tiers-public.js` - Tiers API
- `members-stripe-connect.js` - Stripe Connect API

## Glossary

- **Ghost**: The open-source publishing platform being modified
- **Stripe**: The third-party payment processor integrated with Ghost for handling subscriptions and donations
- **Payment Event**: A record of a payment transaction made by a member
- **Subscription**: A recurring payment arrangement between a member and the site
- **Product/Tier**: A membership level that can have associated pricing and benefits
- **Donation**: A one-time payment made by a visitor or member
- **Offer**: A promotional discount or special pricing for subscriptions
- **Member**: A registered user who can have free or paid membership status
- **Portal**: The frontend membership UI component that handles signups, payments, and account management
- **Admin UI**: The administrative interface for managing Ghost settings, products, and payments

## Requirements

### Requirement 1

**User Story:** As a Ghost administrator, I want the Stripe service and payment processing removed from the backend, so that the system no longer processes payment-related operations.

#### Acceptance Criteria

1. WHEN the Ghost server starts THEN the system SHALL operate without loading Stripe service modules
2. WHEN any code references Stripe or payment models THEN the system SHALL have those references removed or replaced with appropriate alternatives
3. WHEN the Stripe service directory is removed THEN the system SHALL continue to function for all non-payment features
4. WHEN Stripe webhook endpoints are accessed THEN the system SHALL return a 404 response

### Requirement 2

**User Story:** As a Ghost administrator, I want payment-related API endpoints removed, so that no payment-related HTTP requests are processed.

#### Acceptance Criteria

1. WHEN a request is made to payment API endpoints (offers, tiers pricing, Stripe webhooks) THEN the system SHALL return a 404 response
2. WHEN the API index is loaded THEN the system SHALL not register payment-related routes
3. WHEN payment endpoint files are removed THEN the system SHALL start without errors

### Requirement 3

**User Story:** As a Ghost administrator, I want the payment database schema removed, so that the database no longer contains payment-related tables and columns.

#### Acceptance Criteria

1. WHEN the database schema is initialized THEN the system SHALL not create payment-related tables
2. WHEN existing payment migration files are removed THEN the system SHALL handle schema changes gracefully
3. WHEN payment table definitions are removed from schema.js THEN the system SHALL not reference payment columns in queries

### Requirement 4

**User Story:** As a Ghost administrator, I want payment UI components removed from the Admin interface, so that administrators cannot access payment management screens.

#### Acceptance Criteria

1. WHEN an administrator navigates to the settings area THEN the system SHALL not display payment configuration options
2. WHEN payment admin views are removed THEN the system SHALL render remaining admin pages without errors
3. WHEN product/tier pricing management is removed THEN the system SHALL handle admin routing without payment routes

### Requirement 5

**User Story:** As a site visitor, I want the Portal UI to function without payment options, so that the membership experience works without payment subscription features.

#### Acceptance Criteria

1. WHEN a visitor views the signup form THEN the system SHALL not display payment or subscription options
2. WHEN a member views their account page THEN the system SHALL not display subscription management or payment history
3. WHEN payment-related Portal components are modified THEN the system SHALL maintain core free membership functionality

### Requirement 6

**User Story:** As a developer, I want all payment references cleaned up across the codebase, so that no orphaned code or broken imports remain.

#### Acceptance Criteria

1. WHEN the codebase is searched for payment imports THEN the system SHALL have zero broken import statements
2. WHEN tests are run THEN the system SHALL pass without payment-related test failures
3. WHEN the application builds THEN the system SHALL compile without payment-related errors

### Requirement 7

**User Story:** As a Ghost administrator, I want member-payment relationships handled appropriately, so that member data remains intact after payment removal.

#### Acceptance Criteria

1. WHEN the member-stripe-customer model is removed THEN the system SHALL preserve core member data
2. WHEN subscription data is removed THEN the system SHALL not corrupt member records
3. WHEN member queries are executed THEN the system SHALL not reference payment join tables

### Requirement 8

**User Story:** As a Ghost administrator, I want product/tier functionality simplified, so that products exist without pricing or Stripe integration.

#### Acceptance Criteria

1. WHEN products are queried THEN the system SHALL return product data without pricing information
2. WHEN the product model is modified THEN the system SHALL remove Stripe-related relationships
3. WHEN product API endpoints are accessed THEN the system SHALL not include payment-related fields

