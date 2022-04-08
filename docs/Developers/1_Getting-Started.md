---
title: Getting Started
---

## Getting Started with the verinice.veo API

Learn how to authenticate and load and create your first elements.

### Prerequisites

In this documentation it is assumed that you are familiar with the
basic concepts of the verinice.veo object model. You can learn more about these concepts in the directory <nuxt-link to="/docs/Technische_Dokumentation/1_Vorwort">Technical Documentation </nuxt-link>. 

### Authentication

verinice.veo uses [OpenID Connect (OIDC)](https://openid.net/connect/) for authentication, which is built on top of [OAuth 2.0](https://oauth.net/2/). [Keycloak](https://www.keycloak.org/) is used as authentication server. Keycloak exposes a variety of REST endpoints for OAuth 2.0 flows. The token endpoint allows us to retrieve an access tokens. For each request sent to the verinice.veo API such an access token is required.

```python
import requests

def get_token():
    body = { 
        'username':USER_NAME, 
        'password':PASSWORD,
        'grant_type':'password',
        'client_id':KEYCLOAK_CLIENT_ID
    }

    response = requests.post(KEYCLOAK_BASE_URL + "/auth/realms/" + KEYCLOAK_REALM + "/protocol/openid-connect/token", data = body)
    if (response.status_code != 200):
        print("Error while getting token, status code: " + str(response.status_code))
    return "Bearer " + response.json().get('access_token')

```
For the creation of a token these parameters must be set:
 - `KEYCLOAK_BASE_URL`: i.g. https://auth.verinice.com/
 - `KEYCLOAK_REALM`: verinice-veo
 - `KEYCLOAK_CLIENT_ID`: verinice-veo-api
 - `USER_NAME`: A valid user name
 - `PASSWORD`: The password for the user

### Load Units

The unit is the root node in veo's object model and the hierarchical root of objects and groups. A unit represents an organization (e.g. a company) or a department in an organization. Therefore, almost all functions in the verinice.veo API require a Unit.

All units owned by the client of an account are loaded with the call of this endpoint:
```python
import requests

token = get_token()
headers = {
    'Authorization': token,
}
units = requests.get("/units", headers=headers, verify=verify_ssl)
```

### Load Domains

The different areas of expertise, which can be managed with veo, are called domains. If a function is called in the API, then mostly a domain must be specified.

All domains that can be edited are loaded with the call of this endpoint:
```python
import requests

token = get_token()
headers = {
    'Authorization': token,
}
domains = requests.get("/domains", headers=headers, verify=verify_ssl)
```