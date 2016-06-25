# structure-bytes
A NodeJS library for making more efficient data transfers by separating the structure from the values and efficiently storing each as byte arrays.

Most data nowadays is stored in files or transfered over HTTP as either text files which can represent a wide variety of data structures (e.g. JSON or YAML) or in a format created to represent only one specific sort of data (e.g. MP3). The idea with this project is to get the advantages of both sorts of formats. To accomplish this, the project was designed with several principles in mind:
- Types (user-created formats of data) are created by combining a wide variety of datatypes, both primitive and recursive. This allows for representations which accurately describe types (e.g. distinguishing between structs and mappings of strings to values, and between arrays and sets, unlike JSON). Types are also much more customizable and flexible than tailored file formats.
- Types are kept separate from values because types are designed to be created once and used to store many different instances (values). This allows for communications to cache the type spec after the first use and only have to send the true values in subsequent requests.
- Redundancy in data storage is kept to a minimum. For example, in an array of structs, the field names are only specified once in the type spec rather than for each element in the array.

Use cases:
- Use when the structure of the data is complicated. For example, if you are just sending text to be interpreted as text, that can be done easily in almost any environment.
- Use when you plan to have many different values for the type (either many different files storing the same sort of information, or many communications of the same sort of information). This will give you the benefit of being able to keep only a single copy of the type spec.
- Use when there is a lot of repetition in the data. If you don't have any arrays, sets, or maps, you can't really benefit from the cutdown on redundancy.

Data types:
(Work in progress)
