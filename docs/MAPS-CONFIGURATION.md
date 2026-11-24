# Google Maps location configuration — Prompt 007

Status: **not configured or activated**. The runtime has no `GOOGLE_MAPS_BROWSER_KEY`, `GOOGLE_PLACES_SERVER_KEY` or `GOOGLE_MAPS_APPROVED=1`. No Google map, Places request, charge or selected location was observed in this checkpoint.

Before activation, the owner must approve Google Maps Platform billing and provide a project with **Maps JavaScript API** and **Places API (New)** enabled. Supply two different keys through the untracked local environment (or a deployment secret store):

- `GOOGLE_MAPS_BROWSER_KEY`: browser-exposed; restrict by HTTP referrer to the approved preview and production origins, and restrict APIs to Maps JavaScript API and Places API (New).
- `GOOGLE_PLACES_SERVER_KEY`: server-only; restrict to Places API (New) and the server's stable outbound IP when that is available. Never expose it through `/maps/config` or a frontend bundle.
- `GOOGLE_MAPS_APPROVED=1`: explicit local activation flag after billing approval. Without all three settings, the UI shows an unavailable state and the server does not call Google.

The client uses Google's Place Autocomplete (New) widget, a draggable Maps marker and keyboard coordinate fields. It requires an explicit **Confirm this location** action. The server requests only `id,formattedAddress,location` from Place Details (New), checks the selected pin against Google's place center, compares addresses, flags duplicates and substantial moves, and stores the original location. This is a *user-submitted pin*, never proof of the exact unit, ownership or rental authority. Provider errors return a retryable unavailable response without recording a false confirmation. Publication additionally requires a reviewed ownership or rental-authority claim; that review workflow is M1.2B.

Google implementation references: [Place Autocomplete (New)](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new), [Maps JavaScript loading](https://developers.google.com/maps/documentation/javascript/load-maps-js-api), [Place Details (New)](https://developers.google.com/maps/documentation/places/web-service/place-details), [API key restrictions](https://developers.google.com/maps/api-security-best-practices).
