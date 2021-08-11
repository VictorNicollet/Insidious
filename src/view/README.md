Views provide an immutable tree of values to be used as props for the map
and GUI components. At the start of each turn, it is generated from the 
(mutable) model and used for rendering until the turn ends. 

This relies on the fact that the model cannot be changed during a turn, 
it is only possible to schedule events and actions which (though they 
can have an immediate feedback) are only applied at end of turn.