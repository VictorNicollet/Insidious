Since most of the game is about a GUI to manage lists of objects, it uses
preact to manage a user interface, with individual components representing
the various windows or window elements. 

### Pattern: component-returning hooks

In order to allow interacting with a component from the outside, the game
uses an unusual pattern of hooks that return components. For instance,
the component representing the left panel is used as follows: 

    const LeftPanel = useLeftPanel();

    // Later...

        <LeftPanel prop={prop} />

    // Later...

        <OtherComponent onEvent={LeftPanel.toggle} />

That is, a `useFoo` hook returns a new instance of a `Foo` component (which 
can be placed into the component tree _at most once_), with methods that 
let external code alter the component's internal state. 