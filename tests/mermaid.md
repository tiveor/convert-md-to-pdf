# Mermaid Test

## Flowchart

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[End]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob
    Bob-->>Alice: Hi Alice
    Alice->>Bob: How are you?
```

## Class Diagram

```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal : +isMammal()
    Duck : +String beakColor
    Duck : +swim()
    Fish : +int sizeInFeet
    Fish : +canEat()
```

## Regular code block (should still highlight)

```js
console.log("this should still highlight normally");
```

## Plain text

This is a normal paragraph to verify regular markdown still works.
