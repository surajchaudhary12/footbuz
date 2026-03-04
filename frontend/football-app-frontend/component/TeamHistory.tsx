import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TeamHistory({ fetchData }) {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    const fetchTeams = async () => {
      const data = await fetchData('teams')
      setTeams(data)
    }

    fetchTeams()
  }, [fetchData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team History</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={(value) => setSelectedTeam(teams.find(team => team.id === parseInt(value)))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTeam && (
          <div className="mt-4">
            <h3 className="font-semibold">{selectedTeam.name}</h3>
            <p className="text-sm text-gray-500">{selectedTeam.league}</p>
            <p className="mt-2">{selectedTeam.history}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}