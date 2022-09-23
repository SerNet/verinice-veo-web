---
title: Getting Started
position: 0
---

## Getting Started with the verinice.veo API

Learn how to authenticate and load and create your first elements.

### Prerequisites

In this documentation it is assumed that you are familiar with the
basic concepts of the verinice.veo object model. You can learn more about these concepts in the directory <DocLink to="/object_model">Object model</DocLink>. 

### Authentication

verinice.veo uses [OpenID Connect (OIDC)](https://openid.net/connect/) for authentication, which is built on top of [OAuth 2.0](https://oauth.net/2/). [Keycloak](https://www.keycloak.org/) is used as authentication server. For each request sent to the verinice.veo API an access token is required. Keycloak exposes a variety of REST endpoints for OAuth 2.0 flows. The token endpoint allows us to retrieve an access tokens. The method `get_token` creates a token with this endpoint:

```python
import requests

def get_token():
    body = { 
        'username':USER_NAME, 
        'password':PASSWORD,
        'grant_type':'password',
        'client_id':'verinice-veo-api'
    }

    response = requests.post("https://auth.verinice.com/auth/realms/verinice-veo/protocol/openid-connect/token", data = body)
    if (response.status_code != 200):
        print("Error while getting token, status code: " + str(response.status_code))
    return "Bearer " + response.json().get('access_token')

```
For the creation of a token these parameters must be set:
 - `USER_NAME`: A valid user name
 - `PASSWORD`: The password for the user

### Load Units

The unit is the root node in veo's object model and the hierarchical root of objects and groups. A unit represents an organization (e.g. a company) or a department in an organization. Therefore, almost all functions in the verinice.veo API require a Unit.

All units owned by the client of an account are loaded with the call of this endpoint:

**[`GET /units`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/unit-controller/getUnits)** - OpenAPI documentation

Python code listing to load units:
```python
import requests

token = get_token()
headers = {
    'Authorization': token,
}
response = requests.get("https://api.verinice.com/veo/units", headers=headers, verify=verify_ssl)
```

The endpoint returns an array of units. The ID or the name of the first unit can be read with this statements:
```python
units = response.json()
unit_id = units[0].get("id")
unit_name = units[0].get("name")
```

### Load Domains

The different areas of expertise, which can be managed with veo, are called domains. If a function is called in the API, then mostly a domain must be specified.

All domains that can be edited are loaded with the call of this endpoint:

**[`GET /domains`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/domain-controller/getDomains)** - OpenAPI documentation


Python code listing to load domains:
```python
import requests

token = get_token()
headers = {
    'Authorization': token,
}
response = requests.get("https://api.verinice.com/veo/domains", headers=headers, verify=verify_ssl)
```

This endpoint also returns an array of domains. The ID or name of the first domain is retrieved with these statements:
```python
domains = response.json()
domain_id = domains[0].get("id")
domain_name = domains[0].get("name")
```

### Load Business Objects

In besides the units, to which all other data refer, and the domains, which give the data business meaning, the ISMS veo business  objects can of course also be loaded and modified via the API. For the operation of management systems for information security and data protection, the object model of veo contains the business objects <DocLink to="/object_model/objects#process">process</DocLink>, <DocLink to="/object_model/objects#asset">asset</DocLink>, <DocLink to="/object_model/objects#scenario">scenario</DocLink>, <DocLink to="/object_model/objects#risk">risk</DocLink>, <DocLink to="/object_model/objects#control">control</DocLink>, <DocLink to="/object_model/objects#incident">incident</DocLink>, <DocLink to="/object_model/objects#document">document</DocLink> and <DocLink to="/object_model/objects#person">person</DocLink>. These objects can be further specified via so-called subtypes. The meaning of these business objects are explained in the <DocLink to="/object_model/objects">_Object Model_ section in the _Business Objects_ chapter</DocLink>.

For each business object type there are the same API endpoints for managing the objects of this type. Endpoint for loading all processes (example):

 **[`GET /processes`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/process-controller/getProcesses)** - OpenAPI documentation

The following snippet shows how to load all processes from a unit:

```python
import requests

token = get_token()
headers = {
    'Authorization': token,
}
response = requests.get("https://api.verinice.com/veo/processes?unit=" + unit_id, headers=headers, verify=verify_ssl)
```
The response of all endpoints returning element lists contains a paginable result with a single page of items, the number of all items in the result, and the number of pages.

containing a single page of items, the number of all items in the result, and the number of pages:

```json
{
    "items": [
        {
            "name": "A business process",
            "id": "004195cf-778b-46be-840e-55c3fcc8edbd",
            ...
        },
        {
            ...
        },
        ...
    ],
    "totalItemCount": 42,
    "pageCount": 5,
    "page": 0
}
```

The number of items in the page can be specified with the `size` parameter, the page number with the `page` parameter:


**[`GET /processes?size=5&page=3`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/process-controller/getProcesses)** - OpenAPI documentation

Now you can iterate over the items in the page to process the data:

```python
response = requests.get("https://api.verinice.com/veo/processes?unit=" + unit_id, headers=headers, verify=verify_ssl)
json_data = response.json()
for process in json_data.get("items"):
    process_id = process.get("id")
```

### Search for business objects


All endpoints for loading ISMS business types have the same search parameters, which are briefly described here. All parameters can be combined as needed.

#### subType 

Find all objects of a certain sub-type:

**[`GET /documents?subType=DOC_Contract`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/document-controller/getDocuments)** - OpenAPI documentation

Finds all documents of the sub-type _DOC_Contract_ (Contracts).

#### name

Find all objects that contain the term in the name:

**[`GET /assets?name=fire`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/asset-controller/getAssets)** - OpenAPI documentation

Finds all assets that contain _fire_ in the name, e.g. an asset _firewall_ or _fire extinguisher_.

#### status

Find all objects of a certain status. The available statuses are:
- _NEW_
- _IN\_PROGRESS_
- _FOR\_REVIEW_
- _RELEASED_
- _ARCHIVED_

**[`GET /controls?status=RELEASED`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/control-controller/getControls)** - OpenAPI documentation

Finds all controls with the status _RELEASED_.


#### hasChildElements

All business objects in veo can have parts of the same type. Find all the objects that have parts.

**[`GET /processes?hasChildElements=true`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/process-controller/getProcesses)** - OpenAPI documentation

Finds all processes that have parts (sub processes).

#### hasParentElements

Find all objects that are a part of another object.

**[`GET /assets?hasParentElements=true`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/asset-controller/getAssets)** - OpenAPI documentation

Finds all assets that that are a part of another asset.

#### childElementIds

Find all objects that have another object as a part. One or more UUIDs can be specified, separated by a comma.

**[`GET /assets?childElementIds=823dfbfa-21d4-4174-b184-38734465cbbb`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/asset-controller/getAssets)** - OpenAPI documentation

Finds all incidents that have incident with ID _823dfbfa-21d4-4174-b184-38734465cbbb_ as a part.