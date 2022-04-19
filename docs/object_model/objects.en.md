---
title: Objects
position: 2
---

### Organisational objects

Organisational objects help to assign objects to users. Organisational objects realise the separation of data into different clients. Within a client, further subgroups can be created, e.g. for subsidiaries or specialist departments.

![veo-organisation-objects](media/veo-organisationsobjekte.png)

#### Client

The client in the object model represents a customer or a client. A client can be an organisation, but a client can also be a single person. The data belonging to a client is separated from the data of other clients and cannot be mixed or linked with each other in any way. It is not possible to transfer data from one client to another. Each object in veo belongs to exactly one client. Several users (accounts) can be assigned to one client. A user can never access data belonging to a client to which he is not assigned.

#### Unit

The unit divides a client into one or more sub-units. A unit represents an organisation (e.g. a company) or a department within an organisation. The unit is the root node in veo's object model and the hierarchical root of objects and groups. A unit is assigned to exactly one client. There can be any number of units in a client. When a user works with veo, a unit must always be selected first. All other objects and groups are always assigned to exactly one unit. It is not possible to create objects in veo that are not assigned to a unit. The unit is an organisational object that has no subject-related function. If a unit is deleted, all objects in the unit are also deleted.

### Subject objects

For the operation of management systems for information security and data protection, the object model of veo contains the subject objects [process](#process), [asset](#asset), [scenario](#scenario), [risk](#risk), [control](#control), [incident](#incident), [document](#document) and [person](#person). These objects can be further specified via so-called subtypes.

![veo-subject-objects](media/veo-fachobjekte.png)

#### Process

A business process is a sequence of activities that uses resources to convert inputs into results:

* BSI IT-Grundschutz: "business process".
* DS-GVO: "processing activity

#### Asset

An object that has a recognisable value to an organisation, an asset. There are many types of assets: Information, software, servers, people and their qualifications, skills and experience, as well as intangible assets such as reputation and image.

Assets can contain other assets (see [Composites](#composites)). System components often have a recursive structure:

> NIST SP 800-160 Vol. 1 under system element from ISO/IEC/IEEE 15288
> Component: Member of a set of elements that constitute a system.
> Note 1: A system element can be a discrete component, product, service, subsystem, system, infrastructure, or enterprise.
> Note 2: Each element of the system is implemented to fulfil specified requirements.
> Note 3: The recursive nature of the term allows the term system to apply equally when referring to a discrete component or to a large, complex, geographically distributed system-of-systems.
> Note 4: System elements are implemented by: hardware, software, and firmware that perform operations on data/information; physical structures, devices, and components in the environment of operation; and the people, processes, and procedures for operating, sustaining, and supporting the system elements.

The object type "asset" is suitable, for example, for mapping the following types from the standards mentioned:

* BSI IT-Grundschutz: Target objects
* ISO 2700x: Assets
* NIST SP 800-61: Component, System, System-of-Interest, Capability

#### Scenario

A situation that can occur and endanger information security. Describes a single damaging event or a set of damaging events that can be assigned to a specific threat source.

The object type "scenario" is suitable, for example, for mapping the following types from the standards mentioned:

* BSI IT-Grundschutz: both "threat" and "hazard" (via subtypes).
* NIST SP 800-30: both "Threat Event" and "Threat Scenario" (via subtypes)
* ISO 27005: "Incident Scenario", "Threat" (via subtypes)

#### Risk

Risk is a measure of the extent to which an event or circumstance affects a goal to be achieved. The effect can also be positive (opportunity). Risk expresses uncertainty/uncertainty (ISO 27000: "Uncertainty"). Risk is always defined in the application by assigning risk carriers to scenarios. Risk carriers can be: Assets, processes, scopes.

The risk can be assigned to a risk owner (ISO/IEC 27000: "a person or entity with the accountability and authority to manage a risk"). In the terminology of NIST 800-30, this corresponds to the "information owner" (not the "risk assessor"). The assignment of a risk owner is optional.

A risk can be mitigated by a control. This assignment is optional.

The assessment of the impact and probability of a scenario can be included in the assessment of the risk. Risks in information security can be related to a vulnerability being exploited by a threat, causing damage to the organisation.

The object type "risk" is suitable, for example, for mapping the following terms from the standards mentioned:

* BSI IT-Grundschutz: "Risk"
* NIST SP 800-30: "Risk

#### Control

A control is a measure that modifies a risk. A control can be a policy, procedure, guideline or approach of an administrative, technical, management or legal nature.

The Control object type can also represent a group of controls (see "Composite"). This can be used to map a chapter from a standard with measures, or a "building block" from BSI IT-Grundschutz.

The object type "Control" is suitable, for example, for mapping the following terms from the standards mentioned:

* BSI IT-Grundschutz: "building block", "requirement" and "measure" (via subtypes).
* NIST SP 1800-15B: "Control
* DS-GVO: "Technical and organisational measures".

#### Incident

An incident is an event that has occurred and may have endangered information security. An incident can be triggered by a threat.

The object type "Incident" is suitable, for example, for mapping the following terms from the standards mentioned:

* BSI IT-Grundschutz: "Security Incident"
* NIST CSF/FIPS 200: "Incident
* DS-GVO: "Personal data breach".

#### Person

A person, group of persons or a role that is related to the other objects. Any person who is considered an asset.

For example, the object type 'person' is suitable for mapping the following terms from the above standards:

* NISTIR 7693: "Person".

#### Document

A document that describes another object or provides additional information. Used to map policies, guidelines, policy documents, incident documentation, etc. regardless of format, medium or source.

The document can refer to: the management system and its processes, procedural documentation (ISO 27001: "Documentation") and records for verification purposes (ISO 27001: "Records").

For example, the object type "Document" is suitable for mapping the following terms from the standards mentioned:

* ISO 27001: "Documented information", "Documentation" and "Records" (via subtypes).

#### Composites

Each of the subject objects can represent a single object or a group of objects. For this purpose, each subject object can contain objects of the same type. If a subject object contains such sub-objects, then it is modelled as a composite object. Any subject object can be made into a composite at any time by adding sub-objects to it.

Examples are: Teams that consist of individual persons, a server cabinet that contains individual servers or a building block (control) from IT-Grundschutz that contains many individual measures. In all use cases in veo, a composite object can be used in the same way as a single object. For each case, it can be decided individually whether it makes more sense to consider the individual sub-objects or the composite object as a whole.

Objects that are part of a composite can be considered as a whole or individually. For example, an asset in a risk analysis can be a data centre, a server room or even an individual server, which were mapped together as the composite "data centre".

A subject object can be contained in several composites at the same time. For example, the person "Ms. Müller" can be a sub-object in the person composites "Sales Department" and "Project Team" at the same time.

![veo-szenario-RZ-server](media/veo-szenario-RZ-server.png)

#### Scope

Scopes provide another grouping mechanism. Unlike composites, subject objects of different types can be combined into a group here.

* A scope (like any other subject object) is always assigned to exactly one unit and thus also to one client.
* Scopes can contain any subject objects or other scopes.
* A subject object can be contained in several scopes.
* If a scope is deleted, the contained scopes and subject objects are not deleted.

Differentiation from composites: unlike composites, not all operations that operate on the subject objects are available on these groups. An asset composite or scenario composite can be used in risk analyses in the same way as a single asset. This is not the case with scopes.

Scopes have a central role in the organisation of data in veo. In contrast to units, scopes belong to the subject objects, i.e. they are carriers of subject properties and can be used in the use cases for data protection and information security. Since scopes contain other scopes or subject objects, many different organisational units can be mapped with them:

* Organisations, sub-organisations, subsidiaries
* Departments, divisions, teams
* Projects [PMBOK](https://de.wikipedia.org/wiki/A_Guide_to_the_Project_Management_Body_of_Knowledge), ISO 21500 etc.)
* Information networks (IT-Grundschutz)
* Certification scopes (ISO 27001 / ISO 14001 / ISO 9001 ...)
* System-of-Interests (ISO 21839 / ISO 15288)
* System-of-Systems / one system (see above)
* Services (ISO 20000 / ITIL etc.)

Organisations, sub-organisations or subsidiaries are modelled as scopes. A sub-organisation can contain other scopes, which then represent e.g. departments, divisions and teams.

![veo-composite-subsidiaries](media/veo-composite-tochtergesellschaften.png)

An information network for the IT-Grundschutz of the BSI is modelled as a scope that contains one process group, several asset groups and one person group. The groups with subject objects can contain any number of subgroups of the same type. The IT-Grundschutz subject objects application, IT, ICS, IOT system, communication link and room are modelled as assets in veo.

![veo-composite-information-network](media/veo-composite-informationsverbund.png)