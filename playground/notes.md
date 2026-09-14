# Component Comparison Notes

The custom `Modal`, `Tabs`, and `Disclosure` components were intentionally built from scratch for the assignment. They satisfy their requested baseline behaviors and are useful for learning the underlying ARIA and focus-management patterns. The generated shadcn/ui files take a different approach: they are styling and API wrappers around `@base-ui/react/dialog` and `@base-ui/react/tabs`.

## Dialog vs. Custom Modal

- **Focus management is delegated to a dedicated primitive.** `dialog.tsx` renders `DialogPrimitive.Root`, `Trigger`, `Portal`, `Backdrop`, `Popup`, and `Close`; the wrapper does not reimplement focus trapping or restoration. The custom `Modal` manually captures `document.activeElement`, focuses the first matching element, traps Tab, restores focus, applies `inert`, and locks body scrolling. That custom logic is valid for the assignment, but it has more lifecycle and edge-case code to maintain.

- **The portal lifecycle is encapsulated by the primitive.** The custom modal creates a detached element with `useState`, appends it in a passive `useEffect`, and simultaneously tries to focus dialog content in `useLayoutEffect`. On the first open, the portal target can still be detached when the focus effect runs. The generated wrapper delegates portal mounting to `DialogPrimitive.Portal` instead of requiring this component to coordinate portal insertion and focus timing itself; the wrapper source does not expose the primitive's internal timing algorithm.

- **The generated API supports composable open/close controls.** The generated source exposes separate `DialogTrigger` and `DialogClose` components, plus `DialogPortal` and `DialogOverlay`. The custom API exposes only `isOpen` and `onClose`; callers must manage the opener and close controls themselves. The custom API is simpler, but the generated API gives consumers more reusable composition points.

- **Accessible naming and descriptions have separate primitives.** The generated source exposes `DialogTitle` and `DialogDescription`, allowing dialog content to be composed with an accessible title and description. The custom modal always renders a heading and `aria-labelledby`, but has no equivalent `aria-describedby` or description prop. Base UI receives responsibility for the final dialog semantics rather than the wrapper manually assigning every relationship.

- **Dismissal and modal-layer responsibilities are centralized.** The generated source places a `DialogPrimitive.Backdrop` beside `DialogPrimitive.Popup` and supplies a dedicated close primitive. The custom modal handles Escape explicitly and prevents background interaction with `inert`, but it does not provide a separate overlay interaction API or a primitive close control. The generated wrapper delegates the exact dismissal behavior to Base UI rather than implementing it locally; the wrapper itself does not show which backdrop interactions are enabled.

## Tabs vs. Custom Tabs

- **Keyboard behavior is delegated instead of hand-coded.** `tabs.tsx` does not contain key handlers or focus refs; `TabsPrimitive.Root`, `List`, `Tab`, and `Panel` own the tabs interaction model. The custom component explicitly handles ArrowLeft, ArrowRight, Home, End, Enter, and Space with an array of button refs. The custom implementation correctly expresses the requested manual-activation behavior, but every keyboard edge case remains application code.

- **The generated API supports more composition and orientation choices.** The generated `Tabs` accepts the primitive root props and an `orientation` prop, while separate `TabsList`, `TabsTrigger`, and `TabsContent` components allow arbitrary content structure. The custom component accepts a single data array of `{ id, label, content }` and always renders a horizontal tablist. That data-driven API is clean and reusable for the assignment, but less flexible for custom layouts and vertical tabs.

- **State behavior is provided at the primitive root.** The generated wrapper forwards all `TabsPrimitive.Root.Props`, so selection state and other root options are owned by the underlying tabs primitive. The custom component implements its own controlled/uncontrolled selection using `value`, `defaultValue`, `onValueChange`, and local state. That state model is correct for the requested use case, but the primitive avoids duplicating selection and focus coordination in the wrapper.

- **Disabled and unusual tab collections have more manual edge cases in the custom version.** The custom code skips disabled tabs for directional, Home, and End navigation, but if every tab is disabled, `firstEnabledIndex` is `-1` and no tab receives `tabIndex={0}`. It also falls back when a controlled value is missing or disabled without notifying the parent. The generated wrapper delegates disabled-tab and selection coordination to Base UI rather than implementing those cases locally. The provided generated source does not show whether or how the primitive resolves every unusual collection, so this is a difference in responsibility, not a claim that the wrapper visibly implements a particular edge-case algorithm.

- **ARIA attributes are generated by the primitive rather than assembled manually.** The custom component explicitly sets `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, and `aria-labelledby`. The generated wrapper passes props to Base UI primitives, which own the final tab and panel markup and relationships. The custom ARIA implementation is clear and meets the assignment requirements; the generated approach reduces the amount of accessibility wiring maintained by application code.

## Disclosure

There is no generated Disclosure file in the reviewed source. The custom `Disclosure` is therefore not directly comparable to a generated disclosure primitive. It is intentionally small and correct for its scope: a native button toggles state, `aria-expanded` reflects the state, and `aria-controls` points to a stable `useId`-based panel ID. It does not provide the broader compositional primitive API or delegated interaction behavior available from the generated Dialog and Tabs wrappers.
