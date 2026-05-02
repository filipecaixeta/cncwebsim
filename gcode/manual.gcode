; Setup
G90 ( Absolute )
G1 Z1 F1000
G1 Z0 F1000
G1 X7.255
G1 X6.255                   (13.51 mm start diameter)

; Start
M3 S31250 ( Spindle ON )

; Cut
G91 ( Relative )
G1 X-0.5                    (12.89 mm end diameter)
G1 X-0.1                    (12.71 mm end diameter, gives 0.18 mm diameter delta instead of 0.20)
G1 Z-20

; Return to start
G90 ( Absolute )
G1 Z0
G1 X6.255

; Stop
M5 S0 ( Spindle OFF )
