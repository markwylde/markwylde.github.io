import { PITFALLS } from "./data";

export default function PitfallsTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Symptom</th>
          <th>Likely cause</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {PITFALLS.map((p) => (
          <tr key={p.symptom}>
            <td>{p.symptom}</td>
            <td>{p.cause}</td>
            <td>{p.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
