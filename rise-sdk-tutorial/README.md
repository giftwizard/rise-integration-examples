# Rise SDKs

> ⚠️ **Important Note**  
> This documentation is only relevant to **Rise v2.0**. If you notice any discrepancies or if the information differs from what you know, please reach out to the Rise support team for assistance.

---

## Available SDKs

<table style="border-spacing: 16px; border-collapse: separate;">
<tr>
<td width="25%" align="center" style="border: 2px solid #e1e4e8; border-radius: 12px; padding: 24px; vertical-align: top;">

<div style="min-height: 60px; display: flex; align-items: center; justify-content: center;">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

</div>

**TypeScript SDK**

[npm](https://www.npmjs.com/package/rise-typescript-sdk)

[GitHub](https://github.com/giftwizard/rise-typescript-sdk)

[Quickstart](https://github.com/giftwizard/rise-typescript-sdk#quickstart)

</td>
<td width="25%" align="center" style="border: 2px solid #e1e4e8; border-radius: 12px; padding: 24px; vertical-align: top;">

<div style="min-height: 60px; display: flex; align-items: center; justify-content: center;">

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

</div>

**Java SDK**

[GitHub](https://github.com/giftwizard/rise-java-sdk)

[Quickstart](https://github.com/giftwizard/rise-java-sdk#quickstart)

</td>
<td width="25%" align="center" style="border: 2px solid #e1e4e8; border-radius: 12px; padding: 24px; vertical-align: top;">

<div style="min-height: 60px; display: flex; align-items: center; justify-content: center;">

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

</div>

**Python SDK**

[GitHub](https://github.com/giftwizard/rise-python-sdk)

[Quickstart](https://github.com/giftwizard/rise-python-sdk#quickstart)

</td>
<td width="25%" align="center" style="border: 2px solid #e1e4e8; border-radius: 12px; padding: 24px; vertical-align: top;">

<div style="min-height: 60px; display: flex; align-items: center; justify-content: center;">

![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)

</div>

**.NET SDK**

[GitHub](https://github.com/giftwizard/rise-dotnet-sdk)

[Quickstart](https://github.com/giftwizard/rise-dotnet-sdk#quickstart)

</td>
</tr>
</table>

---

## What is an SDK?

An **SDK (Software Development Kit)** is a set of pre-built tools, libraries, and code that makes it easier for developers to integrate with a service or platform. Instead of manually constructing API requests and handling authentication, error handling, and data formatting yourself, an SDK provides ready-to-use functions that abstract away these complexities.

Think of it as a toolkit that lets you focus on building your application logic rather than dealing with the technical details of API integration. With Rise SDKs, you can integrate loyalty programs and gift card functionality into your application with just a few lines of code.

---

## Overview

Official SDKs for integrating with the **Rise loyalty and gift card platform**. Build powerful customer loyalty programs, manage digital gift cards, and create wallet-based rewards systems with type-safe, production-ready SDKs.

---

## Why Use Rise SDKs?

| Feature | Description |
|---------|-------------|
| **Type Safety** | Full type support with auto-generated types from our OpenAPI spec |
| **Simplified Authentication** | Built-in OAuth and API Key authentication handling |
| **Comprehensive Coverage** | Access all Rise platform APIs through a single client |
| **Production Ready** | Automatic token management, error handling, and retry logic |
| **Developer Experience** | Intuitive API namespaces and clear documentation |

---

## Authentication

Rise SDKs support both authentication methods depending on your integration type:

<table>
<tr>
<td width="50%" valign="top">

**OAuth Authentication**

For applications that integrate on behalf of multiple Rise merchants. The SDK automatically handles token fetching.

</td>
<td width="50%" valign="top">

**API Key Authentication**

For direct server-to-server integrations with a single Rise account. Requires your API token and account ID.

</td>
</tr>
</table>

[Learn more about authentication flows →](https://platform.rise.ai/docs#tag/Integrate-your-application-with-Rise/App-Installation-Flow/Step-2-or-Handle-installation-authentication-in-your-app)

---

## API Coverage

The SDKs provide complete access to these Rise platform APIs:

| API | Description |
|-----|-------------|
| **Gift Cards** | Create, query, update, and manage gift card lifecycle |
| **Gift Card Orders** | Process orders, fulfillment, and status updates |
| **Wallets** | Customer wallet management and queries |
| **Wallet Actions** | Credits, debits, and loyalty reward operations |
| **Transactions** | Query transaction history across gift cards |
| **Recipients** | Manage gift card recipient information |
| **Workflows** | Event reporting and automation integration |

---

## Next Steps

1. **Choose your SDK** - Select the SDK for your preferred language from the options above
2. **Review the Quickstart** - Get up and running in minutes with our language-specific guides
3. **Explore the API docs** - Dive into the [full API reference](https://platform.rise.ai/docs) for detailed information

---
