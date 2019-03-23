/********************************************************************
Copyright (C) 2019 Michail Vourlakos <mvourlakos@gmail.com>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*********************************************************************/

var windowsWithAlternativeSchemes = [];

workspace.clientActivated.connect(clientActivatedSlot);
workspace.clientRemoved.connect(clientRemovedSlot);
workspace.clientAdded.connect(connectSignals);

// connect all existing clients
var clients = workspace.clientList();
for (var i=0; i<clients.length; i++) {
    connectSignals(clients[i]);
}

//! Functions
function connectSignals(client) {
    client.colorSchemeChanged.connect(client, function () {
        clientActivatedSlot(this);
    });
}

function validId(client) {
    var id = client.windowId;
    
    if (id <= 0 ) {
        //wayland case
        id = client.surfaceId;
    }
    
    return id;    
}


function clientActivatedSlot(client) {
    if (client && client.active) {
        if (client.colorScheme!="kdeglobals") {
            var winId = validId(client);
            if (windowsWithAlternativeSchemes.indexOf(winId) === -1) {
                windowsWithAlternativeSchemes.push(winId);
            }
            
            var winIdAndScheme = winId + "-" + client.colorScheme;
            //print(winIdAndScheme);
            callDBus("org.kde.lattedock", "/Latte", "org.kde.LatteDock", "windowColorScheme", winIdAndScheme);
        } else {
            clientRemovedSlot(client);
        }
    }
}


function clientRemovedSlot(client) {
    var winId = validId(client);
    
    var removedPos = windowsWithAlternativeSchemes.indexOf(winId);
    
    if (removedPos !== -1) {
        windowsWithAlternativeSchemes.splice(removedPos, 1);
        var winIdAndScheme = winId + "-" + "kdeglobals";
        callDBus("org.kde.lattedock", "/Latte", "org.kde.LatteDock", "windowColorScheme", winIdAndScheme);        
    }
}
