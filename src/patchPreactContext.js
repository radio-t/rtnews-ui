// hack for https://github.com/developit/preact-compat/issues/475
// should be changed when preact@10 is available

import React from "preact-compat";
import { createContext } from "preact-context";

React.createContext = createContext;
