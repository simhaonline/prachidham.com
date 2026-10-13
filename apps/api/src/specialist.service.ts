import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class SpecialistService {
  private async call(baseUrl: string | undefined, path: string, body?: unknown): Promise<unknown> {
    const token = process.env.INTERNAL_SERVICE_TOKEN;
    if (!baseUrl || !token) throw new ServiceUnavailableException('Specialist service is not configured.');
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(12_000),
      });
    } catch { throw new BadGatewayException('Specialist service is unavailable.'); }
    if (response.status === 400 || response.status === 422) throw new BadRequestException('The specialist request is invalid.');
    if (response.status === 503) throw new ServiceUnavailableException('Specialist provider is not configured.');
    if (!response.ok) throw new BadGatewayException('Specialist service request failed.');
    return response.json();
  }

  summary(body: unknown) {
    if (!body || typeof body !== 'object' || typeof (body as Record<string, unknown>).title !== 'string' || typeof (body as Record<string, unknown>).text !== 'string') {
      throw new BadRequestException('title and text are required.');
    }
    const value = body as { title: string; text: string };
    if (value.title.length > 160 || value.text.length > 4000) throw new BadRequestException('Input exceeds the allowed length.');
    return this.call(process.env.INTELLIGENCE_URL, '/summarize', { title: value.title, text: value.text });
  }

  distance(query: Record<string, unknown>) {
    const keys = ['lat1', 'lon1', 'lat2', 'lon2'];
    const params = new URLSearchParams();
    for (const key of keys) {
      const value = query[key];
      if (typeof value !== 'string' || value.length > 40) throw new BadRequestException('Four valid coordinates are required.');
      params.set(key, value);
    }
    return this.call(process.env.GEO_URL, `/distance?${params.toString()}`);
  }
}
