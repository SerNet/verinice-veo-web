---
title: Getting Started
---

## Getting Started with the verinice.veo API

Learn how to authenticate and load and create your first elements.

### Prerequisites

In this documentation it is assumed that you are familiar with the
basic concepts of the verinice.veo object model. You can learn more about these concepts in the directory <nuxt-link to="/docs/Technische_Dokumentation/1_Vorwort">Technical Documentation </nuxt-link>. 

### Authentication

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

def load_first_element():
    token = get_token()
    url = veo_base_url + "/domains"
    headers = {
        'Authorization': token,
    }
    requests.get(url, headers=headers, verify=True)

```

### Load Units

### Load Domains