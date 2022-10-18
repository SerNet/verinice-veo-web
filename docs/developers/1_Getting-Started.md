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

verinice.veo uses [OpenID Connect (OIDC)](https://openid.net/connect/) for authentication, which is built on top of [OAuth 2.0](https://oauth.net/2/). [Keycloak](https://www.keycloak.org/) is used as authentication server. For each request sent to the verinice.veo API an access token is required. Keycloak exposes a variety of REST endpoints for OAuth 2.0 flows. The token endpoint allows us to retrieve an access token. The method `get_token` creates a token with this endpoint:

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

### Load a single business object

A single object can be loaded with its UUID. API endpoint to load a process:

**[`GET /processes/e529ee00-c995-444f-9a1d-2c07cf03143e`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/process-controller/getProcess)** - OpenAPI documentation

Python code listing to load a process:
```python
import requests

token = get_token()
headers = {
    'Authorization': token,
}
response = requests.get("https://api.verinice.com/veo/processes/e529ee00-c995-444f-9a1d-2c07cf03143e", headers=headers, verify=verify_ssl)
```

If you take a closer look at the element in the response, you will see that it is built up of different parts:

```json{11,17,47} 
{
    "createdAt": "2022-06-27T15:11:59.877590Z",
    "createdBy": "username A",
    "updatedAt": "2022-06-27T15:11:59.877590Z",
    "updatedBy": "username B",
    "name": "Business process",
    "designator": "PRO-347",
    "description": "A business process, business method or business function is a collection of related, \
    structured activities or tasks by people or equipment in which a specific sequence produces a service \
    or product for a particular customer or customers.",
    "owner": {
        "displayName": "veo Unit",
        "targetUri": "https://api.develop.verinice.com/veo/units/a602f30d-54be-4565-bacd-3c422ab88e18",
        "searchesUri": "https://api.develop.verinice.com/veo/units/searches",
        "resourcesUri": "https://api.develop.verinice.com/veo/units{?parent,displayName}"
    },
    "links": {
        "process_dataType": [
            {
                "domains": [],
                "attributes": {},
                "target": {
                    "displayName": "AST-935 Customer data",
                    "targetUri": "https://api.develop.verinice.com/veo/assets/faf5d744-2bc8-4c19-bd5f-783f59d719a2",
                    "searchesUri": "https://api.develop.verinice.com/veo/assets/searches",
                    "resourcesUri": "https://api.develop.verinice.com/veo/assets{?unit,displayName,subType,status,\
                    childElementIds,hasParentElements,hasChildElements,description,designator,name,updatedBy,size,page,\
                    sortBy,sortOrder}"
                }
            }
        ],
        "process_processor": [
            {
                "domains": [],
                "attributes": {},
                "target": {
                    "displayName": "SCP-460 IT Development Company",
                    "targetUri": "https://api.develop.verinice.com/veo/scopes/26757ad0-a76b-41ab-bbcb-9b67e2fc1c90",
                    "searchesUri": "https://api.develop.verinice.com/veo/scopes/searches",
                    "resourcesUri": "https://api.develop.verinice.com/veo/scopes{?unit,displayName,subType,status,\
                    childElementIds,hasParentElements,hasChildElements,description,designator,name,updatedBy,size,page,\
                    sortBy,sortOrder}"
                }
            }
        ]
    },
    "customAspects": {
        "process_recipient": {
            "domains": [],
            "attributes": {
                "process_recipient_type": "process_recipient_type_processor"
            }
        },
        "process_dataTransfer": {
            "domains": [],
            "attributes": {
                "process_dataTransfer_legalBasis": [],
                "process_dataTransfer_explanation": "The data is always deleted after the online meeting has ended.",
                "process_dataTransfer_otherLegalBasis": "Art. 6 Abs. 1 S. 1 lit. b DSGVO"
            }
        }
    },
    "type": "process",
    "parts": [],
    "domains": {
        "b5110307-ca95-4bcb-bd7a-d2570f3d8946": {
            "subType": "PRO_DataTransfer",
            "status": "IN_PROGRESS",
            "decisionResults": {},
            "riskValues": {}
        }
    },
    "id": "20c06dc7-5eec-46ec-b866-72cc12537be2",
    "_self": "https://api.develop.verinice.com/veo/processes/20c06dc7-5eec-46ec-b866-72cc12537be2"
}
```

The element `owner` references a <DocLink to="/object_model/objects#asset">unit</DocLink> to which the element belongs, the element `links` contains links to other elements and `customAspects` contains functional properties of the element. Each subject object belongs to one or more domains. One subtype is defined for each domain for each object. A lifecycle status is also set.

### Object schema

### Create a business object

**[`POST /assets`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/asset-controller/createAsset)** - OpenAPI documentation

After loading a unit and domain ID, a business object can be created with the API endpoint:

**[`POST /assets`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/asset-controller/createAsset)** - OpenAPI documentation

Python code listing to create an asset:

```python
element = {
    'name': 'Mail Server',
    'owner': {
        'targetUri': 'https://api.develop.verinice.com/veo/units/a602f30d-54be-4565-bacd-3c422ab88e18',
    },
    'type': 'asset',
    'domains': {
        'b5110307-ca95-4bcb-bd7a-d2570f3d8946': {
            'subType': 'AST_IT-System',
            'status': 'RELEASED',
        }
    }
}
url = "https://api.develop.verinice.com/veo/assets"
token = get_token()
headers = {
    "Authorization": token,
    "Content-Type": "application/json",
}
response = requests.post(url, data=element, headers=headers, verify=True)
if (response.status_code != 201):
    print("Error while posting element: " + str(response.status_code))
    raise Exception("Error while posting element: " + str(response.status_code))
element_id = response.json().get("resourceId")
```

The element in the listing above contains the mandatory properties that must be present when you create it:
- `name`
- `owner`: A reference to a unit
- `type`: `asset`, `control`, `document`, `incident`, `person`, `process` or `scenario`
- `domains`: References to one or more domains and a `subType` und a `status` per domain. 

### Update a business object

Scopes can be updated with this endpoint, for example:

**[`PUT /scopes/{uuid}`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/scope-controller/updateScope)** - OpenAPI documentation

The enpoints for the other object types have URLs according to their type.

The veo API uses [ETags](https://en.wikipedia.org/wiki/HTTP_ETag) for [optimistic concurrency control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control). This prevents concurrent changes to a resource from multiple clients overwriting each other.

If a single business object is loaded, then together with the object the header `ETag` is returned. The ETag must be sent in the PUT Request as header `If-Match` when updating an object. Python code listing to update a scope with an etag:
```python
import requests
import json
import re
   
token = get_token()
url = "https://api.verinice.com/scopes/e4af7789-5da0-49ed-86c6-8ecea8262f0f"

# Load the scope object
headers = {
    'Authorization': token
}
response = requests.get(url, headers=headers, verify=True)
etag = response.headers["ETag"]
# Extract the ETag that is sent between quotes.
etag = re.findall('"([^"]*)"', etag)[0]

scope:dict = response.json()
# Modify the scope data....

# Update the scope 
# Set etag without quotes as header "If-Match"
headers = {
    "Authorization": token,
    "Content-Type": "application/json",
    "If-Match": etag
}
requests.put(url, data = json.dumps(scope), headers=headers, verify=True)
```

### Delete a business object

To delete an object, execute a request with the DELETE method on the object's URL:

**[`DELETE /scenarios/{uuid}`](https://api.verinice.com/veo/swagger-ui/index.html?configUrl=/veo/v3/api-docs/swagger-config#/scenario-controller/deleteScenario)** - OpenAPI documentation

Python code listing to delete a scenario:

```python
import requests
token = get_token()
url = "https://api.verinice.com/scenarios/e4af7789-5da0-49ed-86c6-8ecea8262f0f"

# Load the scope object
headers = {
    'Authorization': token
}
response = requests.delete(url, headers=headers, verify=True)
```

When a scope is deleted, the members of the scope are not deleted, but removed from the scope before deletion. Also, when an object is deleted that contains parts, the parts are not deleted, but removed from the object before deletion. When a unit is deleted, all elements in the unit are deleted along with the unit.