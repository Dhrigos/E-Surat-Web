<?php

namespace Tests\Feature;

use App\Models\Letter;
use App\Models\LetterTemplate;
use App\Models\LetterType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DynamicTemplateTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_letter_template()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('letter-templates.store'), [
            'name' => 'Test Template',
            'type' => 'test_template',
            'content' => '<p>This is a test template with {{nomor_surat}}</p>',
        ]);

        $response->assertRedirect(route('letter-templates.index'));
        $this->assertDatabaseHas('letter_templates', [
            'name' => 'Test Template',
            'type' => 'test_template',
        ]);
    }

    public function test_pdf_export_uses_template()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Create Template
        $template = LetterTemplate::create([
            'name' => 'PDF Template',
            'type' => 'pdf_template',
            'content' => '<h1>Subject: {{perihal}}</h1><p>Content: {{isi}}</p>',
        ]);

        // Create Letter Type using this template
        $letterType = LetterType::factory()->create([
            'template_id' => $template->id,
        ]);

        // Create Letter
        $letter = Letter::factory()->create([
            'created_by' => $user->id,
            'letter_type_id' => $letterType->id,
            'subject' => 'Dynamic PDF Test',
            'content' => 'This is the body content.',
        ]);

        // Request PDF Export
        $response = $this->get(route('letters.export-pdf', $letter));

        $response->assertStatus(200);
        // We can't easily check the PDF content, but we can check if it didn't crash
        // and returned a PDF mime type.
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
    }
}
