---
title: Forms
position: 3
---
In veo, forms can be defined with which objects can be created from the model. There can be several forms for a subject object. The forms do not have to contain fields for all properties of an object. A form can be used to enter exactly the data needed for a use case. Links and their properties can also be edited with a form. The elements of the forms are described in a form schema. The schema defines which fields are displayed and which aspects are changed with them. In addition, it can be configured which form element is to be used. For example, the selection of an element from a list can be done by a drop-down list or a radio button. In the form schema, it is also possible to flexibly configure how the elements are grouped and arranged in the form.

For example, a simple form for a processing activity may contain the data of the process itself (modelled as <DocLink to="/object_model/objects#process">Process</DocLink> and two links to a server and a responsible person.

![veo-forms-data-VTK](media/veo-forms-data-VTK.png)

If the Technical and Organisational Measures (TOMs) are also to be recorded, then a second form can be created that can additionally manage links to the TOMS, which are modelled as <DocLink to="/object_model/objects#control">Control</DocLink>.

![veo-forms-data-VTK-TOM](media/veo-forms-data-VTK-TOM.png)
